const mapping = require('./mapping');
const transform = require('./transform');

function getSettings() {
  return {
    idKey: 'identifier',
    mapping,
    transform,
    type: 'pharmacy',
  };
}

module.exports = getSettings;
