const getProfilesSettings = require('./profiles/getSettings');
const getPharmaciesSettings = require('./pharmacies/getSettings');
const getSexualHealthSettings = require('./sexual-health-services/getSettings');

const esConfig = {
  index: process.env.ES_INDEX,
  host: process.env.ES_HOST,
  port: Number(process.env.ES_PORT) || 9200,
  requestTimeoutSeconds: Number(process.env.ES_TIMEOUT_SECONDS) || 180,
  noOfReplicas: Number(process.env.ES_REPLICAS) || 1,
  noOfShards: Number(process.env.ES_SHARDS) || 5,

  watcherPrefix: process.env.ES_WATCHER_PREFIX || '.watcher-history-6-',
  monitorPrefix: process.env.ES_MONITOR_PREFIX || '.monitoring-es-6-',
  // hold mappings and transforms on settings to allow adding pharmacy config in future
  settings: {
    profiles: getProfilesSettings(),
    pharmacies: getPharmaciesSettings(),
    'sexual-health-services': getSexualHealthSettings()
  }
};

function getNested(obj, key) {
  // eslint-disable-next-line arrow-body-style
  return key.split('.').reduce((o, x) => {
    return (typeof o === 'undefined' || o === null) ? o : o[x];
  }, obj);
}

function getConnectionParams() {
  return {
    host: `${esConfig.host}:${esConfig.port}`,
    requestTimeout: esConfig.requestTimeoutSeconds * 1000
  };
}

function getIndexSettings() {
  return {
    number_of_shards: esConfig.noOfShards,
    number_of_replicas: esConfig.noOfReplicas
  };
}

function getBody() {
  const body = getNested(esConfig, `settings.${esConfig.index}.mapping`);
  body.settings.index = getIndexSettings();
  return body;
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
  if (!getBody() || !getIdKey()) {
    throw new Error(`invalid config '${esConfig.index}', no mapping or id Key defined`);
  }
}

validateConfig();

module.exports = {
  getConnectionParams,
  getBody,
  getTransform,
  getIdKey,
  getType,
  watcherPrefix: esConfig.watcherPrefix,
  monitorPrefix: esConfig.monitorPrefix
};
