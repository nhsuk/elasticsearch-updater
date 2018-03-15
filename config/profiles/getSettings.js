const mapping = require('./mapping');
const transform = require('./transform');

function getSettings() {
  return {
    idKey: 'choicesId',
    mapping,
    transform,
    type: 'gps',
  };
}

module.exports = getSettings;
