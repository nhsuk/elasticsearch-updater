const schedule = require('node-schedule');
const requireEnv = require('require-environment-variables');

const updateElasticSearch = require('./lib/updateElasticsearch');
const log = require('./lib/utils/logger');
const config = require('./config/config');

requireEnv(['JSON_FILE_URL']);
requireEnv(['ES_HOST']);

async function runUpdater() {
  // run on initial start, then on the schedule
  await updateElasticSearch();

  log.info(`Scheduling Elasticsearch update with rule '${config.updateSchedule}'`);
  schedule.scheduleJob(config.updateSchedule, () => updateElasticSearch());
}

runUpdater();
