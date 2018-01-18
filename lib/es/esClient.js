const elasticsearch = require('elasticsearch');
const waitUntil = require('wait-until');

const toBulkInsertArray = require('./toBulkInsertArray');
const esConfig = require('../../config/esConfig');
const log = require('../utils/logger');

const pollingIntervalMs = Number(process.env.POLLING_INTERVAL) || 5000;
const maxTimes = Number(process.env.MAX_TIMES) || 36;

const client = new elasticsearch.Client(esConfig.getConnectionParams());

function clusterIsHealthy(health) {
  const status = health[0] && health[0].status;
  // Note: yellow is the highest state for a single cluster
  return status === 'yellow' || status === 'green';
}

function esServerReady() {
  return client.cat.health({ format: 'json' }).then(clusterIsHealthy).catch(() => false);
}

function waitForHealthyEs() {
  return new Promise((resolve, reject) => {
    waitUntil()
      .interval(pollingIntervalMs)
      .times(maxTimes)
      .condition(ready => esServerReady().then(ready))
      .done((result) => {
        // eslint-disable-next-line no-unused-expressions
        result ? resolve() : reject();
      });
  });
}
function ignoreIndexNotFoundError(ex) {
  // ignore error if index doesn't exist
  if (!ex.message.includes('index_not_found_exception')) {
    throw ex;
  }
}

async function getCount(index) {
  let count = 0;
  try {
    const result = await client.count({ index });
    count = result.count;
  } catch (ex) {
    ignoreIndexNotFoundError(ex);
  }
  return count;
}

function createAlias(index, name) {
  log.info(`creating alias '${name}' for index '${index}'`);
  return client.indices.putAlias({ index, name });
}

function swapAliases(oldIndex, newIndex, alias) {
  log.info(`swapping alias '${alias}' from '${oldIndex}' to '${newIndex}'`);
  return client.indices.updateAliases({
    body: {
      actions: [
        { remove: { index: oldIndex, alias } },
        { add: { index: newIndex, alias } }
      ]
    }
  });
}

function findIndexForAlias(aliases, alias) {
  // eslint-disable-next-line no-restricted-syntax
  for (const index of Object.keys(aliases)) {
    const indexAliases = Object.keys(aliases[index].aliases);
    if (indexAliases.find(indexAlias => indexAlias === alias)) {
      return index;
    }
  }
  return undefined;
}

async function getIndexForAlias(alias) {
  const aliases = await client.indices.getAlias();
  return findIndexForAlias(aliases, alias);
}

function createMappings(index) {
  return client.indices.create({ index, body: esConfig.getBody() });
}

function loadData(index, data) {
  const bulkData = toBulkInsertArray(index, esConfig.getType(), esConfig.getIdKey(), data);
  const params = { body: bulkData };
  return client.bulk(params);
}

async function createIndex(name, data) {
  log.info(`creating mappings for index '${name}`);
  await createMappings(name);
  log.info(`loading ${data.length} records into index '${name}`);
  const result = await loadData(name, data);
  const status = {
    count: result.items.length,
    errors: result.errors
  };
  log.info(`load complete: total loaded: ${status.count}, errors: ${status.errors}`);
  return status;
}

async function deleteIndex(index) {
  try {
    log.info(`deleting data in index '${index}'`);
    await client.indices.delete({ index });
    return true;
  } catch (ex) {
    ignoreIndexNotFoundError(ex);
    return true;
  }
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

async function removeOrphanedIndexes(alias) {
  const allIndexes = await client.indices.getAlias();
  const orphans = [...getOrphans(allIndexes, alias), ...getDuplicateAliases(allIndexes, alias)];
  const errors = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const orphan of orphans) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await deleteIndex(orphan);
    } catch (ex) {
      errors.push(ex);
    }
  }
  if (errors.count > 0) {
    throw new Error(errors);
  }
  return orphans;
}

function exists(index) {
  return client.indices.exists({ index });
}

module.exports = {
  waitForHealthyEs,
  getCount,
  getIndexForAlias,
  createAlias,
  swapAliases,
  createMappings,
  loadData,
  createIndex,
  exists,
  delete: deleteIndex,
  removeOrphanedIndexes
};
