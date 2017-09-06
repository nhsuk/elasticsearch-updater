const moment = require('moment');

const fileHelper = require('../utils/fileHelper');
const log = require('../utils/logger');
const esClient = require('./esClient');
const config = require('../../config/config');
const esConfig = require('../../config/esConfig');

function getDateStamp(date) {
  return moment(date).format('YYYYMMDDHHmmSS');
}
function loadJson(filename) {
  const data = fileHelper.loadJson(filename);
  if (data.length === 0) {
    throw new Error('File contains no data');
  }
  return data;
}

function transformData(data) {
  const transform = esConfig.getTransform();
  if (transform) {
    log.info('transforming data');
    return transform(data);
  }
  return data;
}

async function validateData(newCount, previousIndex, threshold) {
  log.info(`getting count for ${previousIndex}`);
  const previousCount = await esClient.getCount(previousIndex);
  log.info(`New count: '${newCount}', previous count: '${previousCount}'`);
  if (newCount < previousCount * threshold) {
    throw new Error(`Total records has dropped from ${previousCount} to ${newCount}. Update cancelled`);
  }
}

async function getPreviousIndex(alias) {
  const indexCurrent = await esClient.getIndexForAlias(alias);
  // if undefined, the index may have been created as the alias name, rather than aliased
  return indexCurrent || alias;
}

async function importDataFromFile(filename, indexAlias, threshold) {
  try {
    // if running locally, wait for ES to start
    if (config.env === 'development') {
      await esClient.waitForEsToStart();
    }

    const latestIndex = `${indexAlias}_${getDateStamp()}`;
    const data = transformData(loadJson(filename));
    const result = await esClient.createIndex(latestIndex, data);

    const previousIndex = await getPreviousIndex(indexAlias);
    await validateData(result.count, previousIndex, threshold);

    // there will be no previous alias if the initial index was the alias name.
    // This will only happen the first time the obsolete 'db-profiles-elastic' image is used.
    // in this case, delete must happen before the index is created to avoid a naming conflict.
    // in normal operation the aliases will be swapped, then the old index deleted.
    if (previousIndex === indexAlias) {
      log.info(`deleting previous data in index '${previousIndex}'`);
      await esClient.delete(previousIndex);
      log.info(`creating alias from '${latestIndex}' to index '${indexAlias}'`);
      await esClient.createAlias(latestIndex, indexAlias);
    } else {
      log.info(`swapping alias '${indexAlias}' from '${previousIndex}' to '${latestIndex}'`);
      await esClient.swapAliases(previousIndex, latestIndex, indexAlias);
      log.info(`deleting previous data in index '${previousIndex}'`);
      await esClient.delete(previousIndex);
    }
    log.info('loading complete');
  } catch (err) {
    // don't delete temp index so data can be viewed if it has failed
    log.error(`Error importing data: ${err}`);
  }
}

module.exports = importDataFromFile;
