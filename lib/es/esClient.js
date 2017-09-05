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

function waitForEsToStart() {
  return new Promise((resolve, reject) => {
    waitUntil()
      .interval(pollingIntervalMs)
      .times(maxTimes)
      .condition(ready => esServerReady().then(ready))
      .done((result) => {
        // eslint-disable-next-line no-unused-expressions
        result ? resolve() : reject();
      }
      );
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
  return client.indices.putAlias({ index, name });
}

function swapAliases(oldIndex, newIndex, alias) {
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
  return client.indices.create({ index, body: esConfig.getMapping() });
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
    await client.indices.delete({ index });
    return true;
  } catch (ex) {
    ignoreIndexNotFoundError(ex);
    return true;
  }
}

function exists(index) {
  return client.indices.exists({ index });
}

module.exports = {
  waitForEsToStart,
  getCount,
  getIndexForAlias,
  createAlias,
  swapAliases,
  createMappings,
  loadData,
  createIndex,
  exists,
  delete: deleteIndex
};
