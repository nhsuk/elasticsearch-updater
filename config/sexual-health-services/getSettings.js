const mapping = require('./mapping');

function getSettings() {
  return {
    type: 'sexual-health-service',
    idKey: 'id',
    mapping
  };
}

module.exports = getSettings;
