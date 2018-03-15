const moment = require('moment');

function getArrayOfSize(size) {
  return Array(size).fill();
}

function getDate(index, momentLocal) {
  // first record is the provided date
  const offset = index === 0 ? 0 : 1;
  return momentLocal.subtract(offset, 'days').format('YYYY.MM.DD');
}

function getLastNDays(momentIn, days = 7) {
  // clone moment as subtract mutates the moment
  const momentLocal = moment(momentIn);
  return getArrayOfSize(days).map((val, index) => getDate(index, momentLocal));
}

module.exports = {
  getLastNDays,
};
