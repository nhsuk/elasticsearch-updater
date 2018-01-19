const chai = require('chai');
const moment = require('moment');

const esClient = require('../../lib/es/esClient');
const removeUnwantedIndexes = require('../../lib/es/removeUnwantedIndexes');
const sampleData = require('../resources/sample-data');

const expect = chai.expect;
const maxWaitTime = 1 * 60 * 1000;
const orphanAlias = 'profiles-orphan';
const index1 = `${orphanAlias}_20180117100000`;
const index2 = `${orphanAlias}_20180117100010`;
const index3 = `${orphanAlias}_20180117100020`;
const index4 = `${orphanAlias}_20180117100030`;
const index5 = `${orphanAlias}_20180117100040`;

const watcherPrefix = '.watcher-history-6-';
const monitorPrefix = '.monitoring-es-6-';

function getIndexNames(prefix) {
  const now = moment();
  return [
    prefix + now.format('YYYY.MM.DD'),
    prefix + now.subtract(6, 'days').format('YYYY.MM.DD'),
    prefix + now.subtract(2, 'days').format('YYYY.MM.DD'),
  ];
}

const [todayWatcher, oldestWatcher, expiredWatcher] = getIndexNames(watcherPrefix);
const [todayMonitor, oldestMonitor, expiredMonitor] = getIndexNames(monitorPrefix);

async function deleteTestIndexes() {
  await esClient.delete(index1);
  await esClient.delete(index2);
  await esClient.delete(index3);
  await esClient.delete(index4);
  await esClient.delete(index5);
  await esClient.delete(expiredWatcher);
  await esClient.delete(oldestWatcher);
  await esClient.delete(todayWatcher);
  await esClient.delete(todayMonitor);
  await esClient.delete(oldestMonitor);
  await esClient.delete(expiredMonitor);
}

describe('Elasticsearch Client', function test() {
  this.timeout(maxWaitTime);

  before(async () => {
    await esClient.waitForHealthyEs();
  });

  beforeEach(async () => {
    await deleteTestIndexes();
  });

  it('removeUnwantedIndexes should remove previous indexes with no alias', async () => {
    // simulate creating orphaned indexes - these have the alias as a prefix and a datestamp
    await esClient.createIndex(index1, sampleData);
    await esClient.createIndex(index2, sampleData);
    await esClient.createIndex(index3, sampleData);
    await esClient.createAlias(index1, orphanAlias);
    const result = await removeUnwantedIndexes(orphanAlias);
    // order returned not deterministic, sort before check
    result.sort();
    expect(result.length).to.equal(2);
    expect(await esClient.exists(index2)).to.be.false;
    expect(await esClient.exists(index3)).to.be.false;
    expect(await esClient.exists(index1)).to.be.true;
  });

  it('removeUnwantedIndexes should remove duplicate aliases', async () => {
    // simulate creating orphaned indexes - these have the alias as a prefix and a datestamp
    await esClient.createIndex(index4, sampleData);
    await esClient.createIndex(index5, sampleData);
    await esClient.createAlias(index4, orphanAlias);
    await esClient.createAlias(index5, orphanAlias);
    const result = await removeUnwantedIndexes(orphanAlias);
    // order returned not deterministic, sort before check
    result.sort();
    expect(result.length).to.equal(1);
    expect(result[0]).to.equal(index4);
    expect(await esClient.exists(index4)).to.be.false;
    expect(await esClient.exists(index5)).to.be.true;
  });

  it('removeUnwantedIndexes should remove watcher histories older than 7 days', async () => {
    // simulate creating orphaned indexes - these have the alias as a prefix and a datestamp
    await esClient.createIndex(expiredWatcher, sampleData);
    await esClient.createIndex(oldestWatcher, sampleData);
    await esClient.createIndex(todayWatcher, sampleData);
    const result = await removeUnwantedIndexes(orphanAlias);
    // order returned not deterministic, sort before check
    result.sort();
    expect(result.length).to.equal(1);
    expect(result[0]).to.equal(expiredWatcher);
    expect(await esClient.exists(todayWatcher)).to.be.true;
    expect(await esClient.exists(oldestWatcher)).to.be.true;
    expect(await esClient.exists(expiredWatcher)).to.be.false;
  });

  it('removeUnwantedIndexes should remove monitor histories older than 7 days', async () => {
    // simulate creating orphaned indexes - these have the alias as a prefix and a datestamp
    await esClient.createIndex(expiredMonitor, sampleData);
    await esClient.createIndex(oldestMonitor, sampleData);
    await esClient.createIndex(todayMonitor, sampleData);
    const result = await removeUnwantedIndexes(orphanAlias);
    // order returned not deterministic, sort before check
    result.sort();
    expect(result.length).to.equal(1);
    expect(result[0]).to.equal(expiredMonitor);
    expect(await esClient.exists(todayMonitor)).to.be.true;
    expect(await esClient.exists(oldestMonitor)).to.be.true;
    expect(await esClient.exists(expiredMonitor)).to.be.false;
  });
});
