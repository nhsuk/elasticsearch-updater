const chai = require('chai');

const esClient = require('../../lib/es/esClient');
const sampleData = require('../resources/sample-data');

const expect = chai.expect;
let startTime;
const maxWaitTime = 3 * 60 * 1000;

function serverReady() {
  // delete non existant index as a server test
  return esClient.delete('nosuch').then(() => true).catch(() => false);
}

function wait(done) {
  serverReady().then((res) => {
    if (res || (new Date() - startTime) > maxWaitTime) {
      done();
    } else {
      setTimeout(() => wait(done), 3000);
    }
  });
}

describe('Elasticsearch Client', function test() {
  this.timeout(maxWaitTime);
  before((done) => {
    startTime = new Date();
    wait(done);
  });

  it('delete should remove index', (done) => {
    esClient.delete('profiles').then(() => {
      esClient.getCount('profile').catch((err) => {
        expect(err.message).to.include('index_not_found_exception');
        done();
      });
    }
    ).catch(done);
  });

  it('delete should silently fail when trying to remove indexes that do not exist', (done) => {
    esClient.delete('profilesNot').then(() => {
      done();
    }
    ).catch(done);
  });

  it('createMappings should create index mappings', (done) => {
    esClient.createMappings('profiles').then((result) => {
      expect(result.acknowledged).to.equal(true);
      done();
    }
    ).catch(done);
  });

  it('load data should create index', (done) => {
    esClient.loadData('profiles', sampleData).then((result) => {
      // eslint-disable-next-line no-unused-expressions
      expect(result.items).to.exist;
      done();
    }
    ).catch(done);
  });
});
