const chai = require('chai');

const transform = require('../../../config/profiles/transform');

const expect = chai.expect;

function createSampleRecordArray() {
  return [{
    _id: 40565,
    doctors: ['Dr. Babar Farooq', 'Dr. Kish Iqbal'],
    address: {
      addressLines: [
        'Chapel Street Practice',
        '138 Chapel Street',
        'Salford',
        'England - Uk'
      ],
      postcode: 'M3 6AF'
    }
  }];
}

describe('Profiles transform', () => {
  it('should remove _id', () => {
    const transformedData = transform(createSampleRecordArray());
    expect(transformedData.length).to.equal(1);
    // eslint-disable-next-line
    expect(transformedData[0]._id).to.be.undefined;
  });

  it('should add name field to doctors array', () => {
    const transformedData = transform(createSampleRecordArray());
    expect(transformedData.length).to.equal(1);
    expect(transformedData[0].doctors[0].name).to.equal('Dr. Babar Farooq');
    expect(transformedData[0].doctors[1].name).to.equal('Dr. Kish Iqbal');
  });

  it('should gracefully handle missing doctors', () => {
    const records = createSampleRecordArray();
    delete records[0].doctors;
    const transformedData = transform(records);

    expect(transformedData.length).to.equal(1);
    // eslint-disable-next-line
    expect(transformedData[0].doctors).to.be.undefined;
  });

  it('should add first line of address as alternative name', () => {
    const transformedData = transform(createSampleRecordArray());
    expect(transformedData.length).to.equal(1);
    expect(transformedData[0].alternativeName).to.equal('Chapel Street Practice');
  });

  it('should gracefully handle missing address', () => {
    const records = createSampleRecordArray();
    delete records[0].address;
    const transformedData = transform(records);

    expect(transformedData.length).to.equal(1);
    // eslint-disable-next-line
    expect(transformedData[0].address).to.be.undefined;
  });
});
