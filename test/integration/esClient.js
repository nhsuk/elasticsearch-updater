const chai = require('chai');

const esClient = require('../../lib/es/esClient');
const sampleData = require('../resources/sample-data');

const expect = chai.expect;
let startTime;
const maxWaitTime = 1 * 60 * 1000;
const indexName = 'profiles-test';
const aliasName = 'profiles-alias';

function serverReady() {
  // check if alive by deleting non existent index
  return esClient.delete('nosuchindex').then(() => true).catch(() => false);
}

function waitForEsToStart(done) {
  serverReady().then((res) => {
    if (res || (new Date() - startTime) > maxWaitTime) {
      done();
    } else {
      setTimeout(() => waitForEsToStart(done), 3000);
    }
  });
}

describe('Elasticsearch Client', function test() {
  this.timeout(maxWaitTime);

  before((done) => {
    startTime = new Date();
    waitForEsToStart(done);
  });

  beforeEach((done) => {
    esClient.delete(indexName).then(() => done()).catch(done);
  });

  it('getIndexAlias should return current index for alias', (done) => {
    esClient.createIndex(indexName, sampleData).then(
      () => {
        esClient.createAlias(indexName, aliasName).then(
          () => {
            esClient.getIndexForAlias(aliasName).then((result) => {
              expect(result).to.equal(indexName);
              done();
            }
            ).catch(done);
          }
        );
      }
    );
  });

  it('delete should silently fail when trying to remove indexes that do not exist', (done) => {
    esClient.delete('nosuchindex').then(() => {
      done();
    }
    ).catch(done);
  });

  it('getCount should return zero for an indexes that do not exist', (done) => {
    esClient.getCount('nosuchindex').then((count) => {
      expect(count).to.equal(0);
      done();
    }
    ).catch(done);
  });

  it('create index should create mapping and load data into index', (done) => {
    esClient.createIndex(indexName, sampleData).then((result) => {
      // eslint-disable-next-line no-unused-expressions
      expect(result.count).to.equal(4);
      expect(result.errors).to.equal(false);
      done();
    }
    ).catch(done);
  });
});
