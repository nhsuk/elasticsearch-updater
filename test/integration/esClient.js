const chai = require('chai');

const esClient = require('../../lib/es/esClient');
const data = require('../resources/sample-data');

const expect = chai.expect;

describe('Elasticsearch Client', () => {
  it('getCount should return count of index', (done) => {
    esClient.getCount('profiles').then(
      (result) => {
        expect(result).to.be.greaterThan(0);
        done();
      }
    )
    .catch(done);
  });

  it('delete should remove index', (done) => {
    esClient.delete('profiles').then(
      (result) => {
        expect(result.acknowledged).to.equal(true);
        done();
      }
    )
      .catch(done);
  });

  it('createMappings should create index mappings', (done) => {
    esClient.createMappings('profiles').then(
      (result) => {
        expect(result.acknowledged).to.equal(true);
        done();
      }
    )
      .catch(done);
  });

  it('load data should create index', (done) => {
    esClient.loadData('profiles', 'gps', 'choicesId', data).then(
      (result) => {
        // eslint-disable-next-line no-unused-expressions
        expect(result.items).to.exist;
        done();
      }
    )
      .catch(done);
  });
});
