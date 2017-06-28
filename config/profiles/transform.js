function toNameObject(name) {
  return { name };
}

function sanitiseDataRecord(record) {
  /* eslint-disable no-underscore-dangle*/
  /* eslint-disable no-param-reassign*/
  if (record._id) {
    // not sure this is needed
    // record.id = record._id;
    delete record._id;
  }
  if (record.doctors) {
    record.doctors = record.doctors.map(toNameObject);
  }
  /* eslint-enable no-underscore-dangle */
  /* eslint-enable no-param-reassign*/
  return record;
}

function transform(data) {
  if (data) {
    return data.map(sanitiseDataRecord);
  }
  return data;
}

module.exports = transform;
