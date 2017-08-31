const chai = require('chai');

const transform = require('../../../config/pharmacies/transform');

const expect = chai.expect;

function createSampleRecordArray() {
  return [{
    identifierType: 'Pharmacy Contract',
    openingTimes: {
      general: {
        monday: [
          {
            opens: '08:00',
            closes: '22:30'
          }
        ],
        tuesday: [
          {
            opens: '06:30',
            closes: '22:30'
          }
        ],
        wednesday: [
          {
            opens: '06:30',
            closes: '22:30'
          }
        ],
        thursday: [
          {
            opens: '06:30',
            closes: '22:30'
          }
        ],
        friday: [
          {
            opens: '06:30',
            closes: '22:30'
          }
        ],
        saturday: [
          {
            opens: '06:30',
            closes: '22:00'
          }
        ],
        sunday: [
          {
            opens: '11:00',
            closes: '17:00'
          }
        ]
      },
    },
  }
  ];
}

function expectOpenClose(time, open, close) {
  expect(time.opens).to.equal(open);
  expect(time.closes).to.equal(close);
}

describe('Profiles transform', () => {
  it('should add openingTimesAsOffset to record', () => {
    const transformedData = transform(createSampleRecordArray());
    expect(transformedData.length).to.equal(1);
    const otOffset = transformedData[0].openingTimesAsOffset;
    // eslint-disable-next-line
    expect(otOffset).to.exist;

    expect(otOffset.length).to.equal(7);
    expectOpenClose(otOffset[0], 480, 1350);
    expectOpenClose(otOffset[1], 1830, 2790);
    expectOpenClose(otOffset[2], 3270, 4230);
    expectOpenClose(otOffset[3], 4710, 5670);
    expectOpenClose(otOffset[4], 6150, 7110);
    expectOpenClose(otOffset[5], 7590, 8520);
    expectOpenClose(otOffset[6], 9300, 9660);
  });

  it('should gracefully handle missing openingTimes', () => {
    const records = createSampleRecordArray();
    delete records[0].openingTimes;
    const transformedData = transform(records);

    expect(transformedData.length).to.equal(1);
    // eslint-disable-next-line
    expect(transformedData[0].openingTimes).to.be.undefined;
  });
});
