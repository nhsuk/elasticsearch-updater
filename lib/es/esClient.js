const elasticsearch = require('elasticsearch');
const toBulkInsertArray = require('./toBulkInsertArray');
const config = require('../../config/esConfig');

const client = new elasticsearch.Client(config.getConnectionParams());

function getCount(index) {
  return client.count({ index }).then(result => result.count);
}

function createMappings(index) {
  return client.indices.create({ index, body: config.getMapping(index) });
}

function loadData(index, type, idField, data) {
  const bulkData = toBulkInsertArray(index, type, idField, data);
  const params = { body: bulkData };
  return client.bulk(params);
}

async function deleteIndex(index) {
  try {
    await client.indices.delete({ index });
  } catch (ex) {
    // ignore error if index doesn't exist
    if (!ex.message.includes('index_not_found_exception')) {
      throw ex;
    }
  }
}

module.exports = {
  getCount,
  createMappings,
  loadData,
  delete: deleteIndex
};
