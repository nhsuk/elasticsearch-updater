const mapping = require('./mapping');
const transform = require('./transform');

function getSettings() {
  return {
    type: 'pharmacy',
    idKey: 'identifier',
    mapping,
    transform,
  };
}

module.exports = getSettings;
