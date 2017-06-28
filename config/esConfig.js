const profilesMapping = require('./profiles/mapping');
const profilesTransform = require('./profiles/transform');

const esConfig = {
  host: 'localhost' || process.env.ES_HOST,
  port: 9200 || process.env.ES_PORT,
  // hold mappings and transforms on settings to allow adding pharmacy config in future
  settings: {
    profiles: {
      mapping: profilesMapping,
      transform: profilesTransform,
    }
  }
};

function getConnectionParams() {
  return { host: `${esConfig.host}:${esConfig.port}` };
}

function getMapping(index) {
  if (esConfig.settings[index] && esConfig.settings[index].mapping) {
    return esConfig.settings[index].mapping;
  }
  throw new Error(`no mappings for '${index}'`);
}
function getTransform(index) {
  if (esConfig.settings[index]) {
    return esConfig.settings[index].transform;
  }
  return undefined;
}

module.exports = {
  getConnectionParams,
  getMapping,
  getTransform,
};
