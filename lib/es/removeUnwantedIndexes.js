const moment = require('moment');
const esClient = require('./esClient');
const esConfig = require('../../config/esConfig');
const getLastNDays = require('../utils/dateHelper').getLastNDays;
const log = require('../utils/logger');

function getExpiredIndexes(allIndexes, prefix) {
  const keepers = getLastNDays(moment(), 7).map(day => prefix + day);
  return Object.keys(allIndexes)
    .filter(k => k.startsWith(prefix))
    .filter(k => !keepers.includes(k));
}

function getOrphans(allIndexes, alias) {
  return Object.keys(allIndexes).filter(key => key.startsWith(`${alias}_`) && !allIndexes[key].aliases[alias]);
}

function getDuplicateAliases(allIndexes, alias) {
  const aliases = Object.keys(allIndexes).filter(key => allIndexes[key].aliases[alias]);
  // numeric suffix, so  will be in ascending date order if sorted. Last is newest, so remove it
  aliases.sort().pop();
  return aliases;
}

async function removeUnwantedIndexes(alias) {
  const allIndexes = await esClient.getAllIndexes();
  const watchers = getExpiredIndexes(allIndexes, esConfig.watcherPrefix);
  const monitors = getExpiredIndexes(allIndexes, esConfig.monitorPrefix);
  const orphans = getOrphans(allIndexes, alias);
  const duplicateAliases = getDuplicateAliases(allIndexes, alias);
  const unwanted = [...orphans, ...duplicateAliases, ...watchers, ...monitors];
  const errors = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const index of unwanted) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await esClient.delete(index);
      log(`deleted index '${index}'`);
    } catch (ex) {
      errors.push(ex);
    }
  }
  if (errors.count > 0) {
    throw new Error(errors);
  }
  return unwanted;
}

module.exports = removeUnwantedIndexes;
