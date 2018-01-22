const chai = require('chai');
const moment = require('moment');

const dateHelper = require('../../lib/utils/dateHelper');

const expect = chai.expect;

describe('Date helper', () => {
  it('getLastNDays should return last seven days in YYYY.MM.DD format', () => {
    const days = dateHelper.getLastNDays(moment('2017-01-03'), 7);
    expect(days.length).to.equal(7);
    expect(days[0]).to.equal('2017.01.03');
    expect(days[1]).to.equal('2017.01.02');
    expect(days[2]).to.equal('2017.01.01');
    expect(days[3]).to.equal('2016.12.31');
    expect(days[4]).to.equal('2016.12.30');
    expect(days[5]).to.equal('2016.12.29');
    expect(days[6]).to.equal('2016.12.28');
  });
});
