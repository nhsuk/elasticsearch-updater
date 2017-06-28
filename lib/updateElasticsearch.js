const downloadFile = require('./downloadFile');
const importDataFromFile = require('./es/importDataFromFile');
const fileHelper = require('./utils/fileHelper');
const config = require('../config/config');
const log = require('./utils/logger');

async function runElasticsearchImport(filename) {
  return importDataFromFile(`${config.inputDir}/${filename}`, 'profiles', config.threshold);
}

async function updateElasticsearch() {
  const filename = fileHelper.filenameFromUrl(config.jsonFileUrl);
  try {
    await downloadFile(config.jsonFileUrl, filename);
    return runElasticsearchImport(filename);
  } catch (ex) {
    log.error(`Error Updating database: ${ex.message}`);
    return false;
  }
}

module.exports = updateElasticsearch;
