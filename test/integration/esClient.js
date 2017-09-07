const chai = require('chai');

const esClient = require('../../lib/es/esClient');
const sampleData = require('../resources/sample-data');

const expect = chai.expect;
const maxWaitTime = 1 * 60 * 1000;
const indexName = 'profiles-test';
const aliasName = 'profiles-alias';

describe('Elasticsearch Client', function test() {
  this.timeout(maxWaitTime);

  before((done) => {
    esClient.waitForHealthyEs().then(done);
  });

  beforeEach((done) => {
    esClient.delete(indexName).then(() => done()).catch(done);
  });

  it('getIndexAlias should return current index for alias', async () => {
    await esClient.createIndex(indexName, sampleData);
    await esClient.createAlias(indexName, aliasName);
    return esClient.getIndexForAlias(aliasName).then((result) => {
      expect(result).to.equal(indexName);
    });
  });

  it('delete should silently fail when trying to remove indexes that do not exist', (done) => {
    esClient.delete('nosuchindex').then(() => {
      done();
    }).catch((ex) => {
      done(`should not have thrown error ${ex.message}`);
    });
  });

  it('getCount should return zero for an indexes that do not exist', (done) => {
    esClient.getCount('nosuchindex').then((count) => {
      expect(count).to.equal(0);
      done();
    }).catch(done);
  });

  it('create index should create mapping and load data into index', (done) => {
    esClient.createIndex(indexName, sampleData).then((result) => {
      // eslint-disable-next-line no-unused-expressions
      expect(result.count).to.equal(4);
      expect(result.errors).to.equal(false);
      done();
    }).catch(done);
  });
});
