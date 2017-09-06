const elasticsearch = require('elasticsearch');

const toBulkInsertArray = require('./toBulkInsertArray');
const esConfig = require('../../config/esConfig');
const log = require('../utils/logger');

const client = new elasticsearch.Client(esConfig.getConnectionParams());

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
