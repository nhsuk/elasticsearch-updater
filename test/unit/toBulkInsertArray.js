const chai = require('chai');

const toBulkInsertArray = require('../../lib/es/toBulkInsertArray');

const expect = chai.expect;

describe('Elasticsearch Client', () => {
  it('toBulkInsertArray should restructure array of data for bulk insert', () => {
    const data = [
      { id: 10 },
      { id: 20 }
    ];

    const index = 'profiles';
    const type = 'gps';
    const idKey = 'id';

    const bulkData = toBulkInsertArray(index, type, idKey, data);
    expect(bulkData.length).to.equal(data.length * 2);
    /* eslint-disable no-underscore-dangle */
    expect(bulkData[0].index._id).to.equal(10);
    expect(bulkData[0].index._type).to.equal(type);
    expect(bulkData[0].index._index).to.equal(index);
    expect(bulkData[1]).to.equal(data[0]);
    expect(bulkData[2].index._id).to.equal(20);
    expect(bulkData[2].index._type).to.equal(type);
    expect(bulkData[2].index._index).to.equal(index);
    expect(bulkData[3]).to.equal(data[1]);
    /* eslint-enable no-underscore-dangle */
  });
});
