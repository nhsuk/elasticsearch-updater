const chai = require('chai');

const transform = require('../../../config/sexual-health-services/transform');

const expect = chai.expect;
const id = '123';

describe('Sexual Health Services transform', () => {
  it('should use gsId as uid if available', () => {
    const gsdId = 'gsd01';
    const transformedData = transform([
      { gsdId, id },
    ]);
    expect(transformedData.length).to.equal(1);
    expect(transformedData[0].uid).to.equal(gsdId);
  });

  it('should use odsCode as uid if gsdId not available', () => {
    const odsCode = 'ods001';
    const transformedData = transform([
      { id, odsCode },
    ]);
    expect(transformedData.length).to.equal(1);
    expect(transformedData[0].uid).to.equal(odsCode);
  });

  it('should use id as uid if gsdId or odsCode not available', () => {
    const transformedData = transform([
      { id },
    ]);
    expect(transformedData.length).to.equal(1);
    expect(transformedData[0].uid).to.equal(id);
  });
});
