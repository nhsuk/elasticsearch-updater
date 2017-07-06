const chai = require('chai');

const transform = require('../../../config/profiles/transform');

const expect = chai.expect;

function createSampleRecord() {
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
    const transformedData = transform(createSampleRecord());
    expect(transformedData.length).to.equal(1);
    //eslint-disable-next-line
    expect(transformedData[0]._id).to.be.undefined;
  });

  it('should add name field to doctors array', () => {
    const transformedData = transform(createSampleRecord());
    expect(transformedData.length).to.equal(1);
    expect(transformedData[0].doctors[0].name).to.equal('Dr. Babar Farooq');
    expect(transformedData[0].doctors[1].name).to.equal('Dr. Kish Iqbal');
  });

  it('should add first line of address as alternative name', () => {
    const transformedData = transform(createSampleRecord());
    expect(transformedData.length).to.equal(1);
    expect(transformedData[0].alternativeName).to.equal('Chapel Street Practice');
  });
});
