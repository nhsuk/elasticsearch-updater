const moment = require('moment');

const fileHelper = require('../utils/fileHelper');
const log = require('../utils/logger');
const esClient = require('./esClient');
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

function transformData(index, data) {
  const transform = esConfig.getTransform(index);
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
  // if undefined, it might have been created as the alias name, rather than aliased
  return indexCurrent || alias;
}

async function importDataFromFile(filename, index, threshold) {
  try {
    const latestIndex = `${index}_${getDateStamp()}`;
    const data = transformData(index, loadJson(filename));
    const result = await esClient.createIndex(latestIndex, data);
    const previousIndex = await getPreviousIndex(index);
    await validateData(result.count, previousIndex, threshold);
    log.info(`deleting previous data in index '${previousIndex}'`);
    await esClient.delete(previousIndex);
    log.info(`creating alias to from ${latestIndex} to index '${index}'`);
    await esClient.createAlias(latestIndex, index);
    log.info('loading complete');
  } catch (err) {
    // don't delete temp collection so data can be viewed if it has failed
    log.error(`Error importing data: ${err}`);
  }
}

module.exports = importDataFromFile;
