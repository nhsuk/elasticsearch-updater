const elasticsearch = require('elasticsearch');
const toBulkInsertArray = require('./toBulkInsertArray');
const esConfig = require('../../config/esConfig');

const client = new elasticsearch.Client(esConfig.getConnectionParams());

function getCount(index) {
  return client.count({ index }).then(result => result.count);
}

function createMappings(index) {
  return client.indices.create({ index, body: esConfig.getMapping() });
}

function loadData(index, data) {
  const bulkData = toBulkInsertArray(index, esConfig.getType(), esConfig.getIdKey(), data);
  const params = { body: bulkData };
  return client.bulk(params);
}

async function deleteIndex(index) {
  try {
    await client.indices.delete({ index });
    return true;
  } catch (ex) {
    // ignore error if index doesn't exist
    if (!ex.message.includes('index_not_found_exception')) {
      throw ex;
    }
    return true;
  }
}

module.exports = {
  getCount,
  createMappings,
  loadData,
  delete: deleteIndex
};
