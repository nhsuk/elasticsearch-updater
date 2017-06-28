
const config = {
  app: {
    name: 'elasticsearch-updater'
  },
  env: process.env.NODE_ENV || 'development',
  jsonFileUrl: process.env.JSON_FILE_URL || 'https://nhsukgpdataetl.blob.core.windows.net/etl-output/gp-data-merged.json',
  inputDir: './input',
  // percentage the records can be of previous before erroring
  threshold: process.env.CHANGE_THRESHOLD || 0.99,
};

module.exports = config;
