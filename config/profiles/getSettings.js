const mapping = require('./mapping');
const transform = require('./transform');

function getSettings() {
  return {
    type: 'gps',
    idKey: 'choicesId',
    mapping,
    transform,
  };
}

module.exports = getSettings;
