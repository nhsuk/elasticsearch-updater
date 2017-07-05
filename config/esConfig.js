const profilesMapping = require('./profiles/mapping');
const profilesTransform = require('./profiles/transform');

const esConfig = {
  index: process.env.ES_INDEX || 'profiles',
  host: process.env.ES_HOST,
  port: process.env.ES_PORT || 9200,
  // hold mappings and transforms on settings to allow adding pharmacy config in future
  settings: {
    profiles: {
      type: 'gps',
      idKey: 'choicesId',
      mapping: profilesMapping,
      transform: profilesTransform,
    }
  }
};

function getNested(obj, key) {
  // eslint-disable-next-line arrow-body-style
  return key.split('.').reduce((o, x) => {
    return (typeof o === 'undefined' || o === null) ? o : o[x];
  }, obj);
}

function getConnectionParams() {
  return { host: `${esConfig.host}:${esConfig.port}` };
}

function getMapping() {
  return getNested(esConfig, `settings.${esConfig.index}.mapping`);
}

function getTransform() {
  return getNested(esConfig, `settings.${esConfig.index}.transform`);
}

function getIdKey() {
  return getNested(esConfig, `settings.${esConfig.index}.idKey`);
}

function getType() {
  return getNested(esConfig, `settings.${esConfig.index}.type`);
}

function validateConfig() {
  if (!getMapping() || !getIdKey()) {
    throw new Error(`invalid config '${esConfig.index}', no mapping or id Key defined`);
  }
}

validateConfig();

module.exports = {
  getConnectionParams,
  getMapping,
  getTransform,
  getIdKey,
  getType,
};
