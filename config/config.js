
const config = {
  app: {
    name: 'elasticsearch-updater'
  },
  env: process.env.NODE_ENV || 'development',
  jsonFileUrl: process.env.JSON_FILE_URL || 'https://nhsukgpdataetl.blob.core.windows.net/etl-output/gp-data-merged.json',
  inputDir: './input',
  // percentage the records can be of previous before erroring
  threshold: process.env.CHANGE_THRESHOLD || 0.99,
  // cron style job, default to 7am
  updateSchedule: process.env.UPDATE_SCHEDULE || '0 7 * * *',
};

module.exports = config;
