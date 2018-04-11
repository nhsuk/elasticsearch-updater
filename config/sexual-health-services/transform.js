function addUid(record) {
  // eslint-disable-next-line no-param-reassign
  record.uid = record.gsdId || record.odsCode || record.id;
  return record;
}

function transform(data) {
  return data && data.map(addUid);
}

module.exports = transform;
