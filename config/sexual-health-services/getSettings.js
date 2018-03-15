const mapping = require('./mapping');

function getSettings() {
  return {
    idKey: 'id',
    mapping,
    type: 'sexual-health-service',
  };
}

module.exports = getSettings;
