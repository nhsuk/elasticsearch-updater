const esClient = require('../../lib/es/esClient');

async function deleteAllIndexes() {
  const indexNames = Object.keys(await esClient.getAllIndexes());
  // eslint-disable-next-line no-restricted-syntax
  for (const index of indexNames) {
    // eslint-disable-next-line no-await-in-loop
    await esClient.delete(index);
  }
}
module.exports = {
  deleteAllIndexes
};
