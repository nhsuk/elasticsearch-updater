
const config = {
  app: {
    name: 'elasticsearch-updater',
  },
  env: process.env.NODE_ENV || 'development',
  index: process.env.ES_INDEX,
  inputDir: './input',
  jsonFileUrl: process.env.JSON_FILE_URL,
  // percentage the records can be of previous before erroring
  threshold: Number(process.env.CHANGE_THRESHOLD) || 0.99,
  // cron style job, default to 7am
  updateSchedule: process.env.UPDATE_SCHEDULE || '0 7 * * *',
};

module.exports = config;
