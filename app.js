const schedule = require('node-schedule');
// const requireEnv = require('require-environment-variables');

const updateElasticSearch = require('./lib/updateElasticsearch');
const log = require('./lib/utils/logger');
const config = require('./config/config');

// requireEnv(['JSON_FILE_URL']);

async function runUpdater() {
  // run on initial start, then on the schedule
  await updateElasticSearch();

  log.info(`Scheduling Elasticsearch update with rule '${config.UPDATE_SCHEDULE}'`);
  schedule.scheduleJob(config.UPDATE_SCHEDULE, () => {
    // this is an async function, but await is not allowed within a lambda expression
    updateElasticSearch();
  });
}

runUpdater();
