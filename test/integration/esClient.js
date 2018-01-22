const chai = require('chai');

const esClient = require('../../lib/es/esClient');
const esHelper = require('./esHelper');
const sampleData = require('../resources/sample-data');

const expect = chai.expect;
const maxWaitTime = 60 * 1000;
const indexName = 'profiles-test';
const aliasName = 'profiles-alias';

describe('Elasticsearch Client', function test() {
  this.timeout(maxWaitTime);

  before(async () => {
    await esClient.waitForHealthyEs();
  });

  beforeEach(async () => {
    await esHelper.deleteAllIndexes();
  });

  it('getIndexAlias should return current index for alias', async () => {
    await esClient.createIndex(indexName, sampleData);
    await esClient.createAlias(indexName, aliasName);
    return esClient.getIndexForAlias(aliasName).then((result) => {
      expect(result).to.equal(indexName);
    });
  });

  it('delete should silently fail when trying to remove indexes that do not exist', async () => {
    try {
      await esClient.delete('nosuchindex');
    } catch (ex) {
      expect.fail(`should not have thrown error ${ex.message}`);
    }
  });

  it('getCount should return zero for an indexes that do not exist', async () => {
    const count = await esClient.getCount('nosuchindex');
    expect(count).to.equal(0);
  });

  it('create index should create mapping and load data into index', async () => {
    const result = await esClient.createIndex(indexName, sampleData);
    expect(result.count).to.equal(4);
    expect(result.errors).to.equal(false);
  });
});
