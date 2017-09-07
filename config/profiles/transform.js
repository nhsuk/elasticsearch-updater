function toNameObject(name) {
  return { name };
}

function sanitiseDataRecord(record) {
  /* eslint-disable no-underscore-dangle */
  /* eslint-disable no-param-reassign */
  if (record._id) {
    delete record._id;
  }
  if (record.doctors) {
    record.doctors = record.doctors.map(toNameObject);
  }
  if (record.address) {
    record.alternativeName = record.address.addressLines[0];
  }
  /* eslint-enable no-underscore-dangle */
  /* eslint-enable no-param-reassign */
  return record;
}

function transform(data) {
  return data && data.map(sanitiseDataRecord);
}

module.exports = transform;
