const chai = require('chai');

const importDataFromFile = require('../../lib/es/importDataFromFile');
const esClient = require('../../lib/es/esClient');

const expect = chai.expect;
const maxWaitTime = 1 * 60 * 1000;
const pauseTime = 1000;
const indexName = 'profiles-drop';

async function assertCount(resolve, reject, expectedCount) {
  try {
    const count = await esClient.getCount(indexName);
    expect(count).to.equal(expectedCount);
    resolve(true);
  } catch (ex) {
    reject(ex);
  }
}

async function runSecondImport(resolve, reject, threshold, expectedCount) {
  try {
    await importDataFromFile('./test/resources/raw-data-75pc.json', indexName, threshold);
    setTimeout(() => assertCount(resolve, reject, expectedCount), pauseTime);
  } catch (ex) {
    reject(ex);
  }
}

describe('importDataFromFile', function test() {
  this.timeout(maxWaitTime);

  it('importDataFromFile should not update if count drop is below threshold', async () => {
    await importDataFromFile('./test/resources/raw-data.json', indexName, 0.9);
    return new Promise((resolve, reject) => {
      const threshold90pc = 0.9;
      const expectedCount = 4;
      // Elasticsearch count doesn't updste immediately, add a short wait before running next update
      setTimeout(() => runSecondImport(resolve, reject, threshold90pc, expectedCount), pauseTime);
    });
  });

  it('importDataFromFile should update if count drops is above the threshold', async () => {
    await importDataFromFile('./test/resources/raw-data.json', indexName, 0.9);
    return new Promise((resolve, reject) => {
      const threshold70pc = 0.7;
      const expectedCount = 3;
      // Elasticsearch count doesn't updste immediately, add a short wait before running next update
      setTimeout(() => runSecondImport(resolve, reject, threshold70pc, expectedCount), pauseTime);
    });
  });
});
