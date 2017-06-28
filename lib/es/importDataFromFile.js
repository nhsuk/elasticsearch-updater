const fileHelper = require('../utils/fileHelper');
const log = require('../utils/logger');
const esClient = require('./esClient');
const esConfig = require('../../config/esConfig');

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

async function importDataFromFile(filename, index, type, idKey /* , threshold */) {
  try {
    const data = transformData(index, loadJson(filename));
    log.info(`deleting index '${index}'`);
    await esClient.delete(index);
    log.info(`creating mappings for index '${index}`);
    await esClient.createMappings(index);
    log.info(`loading ${data.length} records into index '${index}`);
    await esClient.loadData(index, type, idKey, data);
    log.info('loading complete');
  } catch (err) {
    // don't delete temp collection so data can be viewed if it has failed
    log.error(`Error importing data: ${err}`);
  }
}

module.exports = importDataFromFile;
