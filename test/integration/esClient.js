const chai = require('chai');

const esClient = require('../../lib/es/esClient');
const sampleData = require('../resources/sample-data');

const expect = chai.expect;
const maxWaitTime = 1 * 60 * 1000;
const indexName = 'profiles-test';
const aliasName = 'profiles-alias';
const orphanAlias = 'profiles-orphan';
const index1 = `${orphanAlias}_20180117100000`;
const index2 = `${orphanAlias}_20180117100010`;
const index3 = `${orphanAlias}_20180117100020`;

describe('Elasticsearch Client', function test() {
  this.timeout(maxWaitTime);

  before(async () => {
    await esClient.waitForHealthyEs().then();
    await esClient.delete(index1);
    await esClient.delete(index2);
    await esClient.delete(index3);
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

  it('delete orphaned indexes should remove previous indexes with no alias', async () => {
    // simulate creating orphaned indexes - these have the alias as a prefix and a datestamp
    await esClient.createIndex(index1, sampleData);
    await esClient.createIndex(index2, sampleData);
    await esClient.createIndex(index3, sampleData);
    await esClient.createAlias(index1, orphanAlias);
    const result = await esClient.removeOrphanedIndexes(orphanAlias);
    // order returned not deterministic, sort before check
    result.sort();
    // eslint-disable-next-line no-unused-expressions
    expect(result.length).to.equal(2);
    expect(result[0]).to.equal(index2);
    expect(result[1]).to.equal(index3);
  });
});
