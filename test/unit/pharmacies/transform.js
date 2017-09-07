const chai = require('chai');

const transform = require('../../../config/pharmacies/transform');

const expect = chai.expect;

const general = {
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
};

const alterations = {
  '2014-05-05': [
    {
      opens: '11:00',
      closes: '16:00'
    }
  ],
  '2014-05-26': [
    {
      opens: '11:00',
      closes: '16:00'
    }
  ],
  '2014-04-18': [
    {
      opens: '11:00',
      closes: '16:00'
    }
  ],
  '2014-04-21': [
    {
      opens: '11:00',
      closes: '16:00'
    }
  ],
  '2014-08-25': [
    {
      opens: '11:00',
      closes: '16:00'
    }
  ]
};

function createSampleRecordArray() {
  return [{
    identifierType: 'Pharmacy Contract',
    openingTimes: {
      general,
      alterations
    },
  }
  ];
}

function createSampleRecordNoAlternativesArray() {
  return [{
    identifierType: 'Pharmacy Contract',
    openingTimes: {
      general
    },
  }
  ];
}

function createSampleRecordNoGeneralArray() {
  return [{
    identifierType: 'Pharmacy Contract',
    openingTimes: {
      alterations
    },
  }
  ];
}

function expectOpenClose(time, open, close) {
  expect(time.opens).to.equal(open);
  expect(time.closes).to.equal(close);
}

function expectAltOpenClose(time, date, open, close) {
  expect(time.date).to.equal(date);
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

  it('should add openingTimesAlterationsAsOffset to record', () => {
    const transformedData = transform(createSampleRecordArray());
    expect(transformedData.length).to.equal(1);
    const otAltOffset = transformedData[0].openingTimesAlterationsAsOffset;
    // eslint-disable-next-line
    expect(otAltOffset).to.exist;
    expect(otAltOffset.length).to.equal(5);
    expectAltOpenClose(otAltOffset[0], '2014-05-05', 660, 960);
    expectAltOpenClose(otAltOffset[1], '2014-05-26', 660, 960);
    expectAltOpenClose(otAltOffset[2], '2014-04-18', 660, 960);
    expectAltOpenClose(otAltOffset[3], '2014-04-21', 660, 960);
    expectAltOpenClose(otAltOffset[4], '2014-08-25', 660, 960);
  });

  it('should gracefully handle missing openingTimes', () => {
    const records = createSampleRecordArray();
    delete records[0].openingTimes;
    const transformedData = transform(records);

    expect(transformedData.length).to.equal(1);
    // eslint-disable-next-line
    expect(transformedData[0].openingTimes).to.be.undefined;
  });

  it('should gracefully handle missing alterations', () => {
    const records = createSampleRecordNoAlternativesArray();
    const transformedData = transform(records);

    expect(transformedData.length).to.equal(1);
    // eslint-disable-next-line
    expect(transformedData[0].openingTimesAlterationsAsOffset).to.be.an('array');
    expect(transformedData[0].openingTimesAlterationsAsOffset.length).to.equal(0);
  });

  it('should gracefully handle missing general', () => {
    const records = createSampleRecordNoGeneralArray();
    const transformedData = transform(records);

    expect(transformedData.length).to.equal(1);
    // eslint-disable-next-line
    expect(transformedData[0].openingTimesAsOffset).to.be.an('array');
    expect(transformedData[0].openingTimesAsOffset.length).to.equal(0);
  });
});
