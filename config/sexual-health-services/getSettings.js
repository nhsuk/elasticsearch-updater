const mapping = require('./mapping');
const transform = require('./transform');

function getSettings() {
  return {
    idKey: 'id',
    mapping,
    transform,
    type: 'sexual-health-service',
  };
}

module.exports = getSettings;
