const fs = require('fs');

function saveJson(obj, filename) {
  const json = JSON.stringify(obj);
  fs.writeFileSync(filename, json, 'utf8');
}

function loadJson(path) {
  const jsonString = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : undefined;
  return jsonString ? JSON.parse(jsonString) : [];
}

function filenameFromUrl(url) {
  const paths = url.split('/');
  return paths[paths.length - 1];
}

module.exports = {
  loadJson,
  saveJson,
  filenameFromUrl
};

