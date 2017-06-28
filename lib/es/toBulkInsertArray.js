function createIndexRecord(index, type, idField, record) {
  return {
    index: {
      _index: index,
      _type: type,
      _id: record[idField],
    }
  };
}

function toBulkInsertArray(index, type, idField, data) {
  const bulkData = [];
  if (data) {
    data.forEach((record) => {
      bulkData.push(createIndexRecord(index, type, idField, record));
      bulkData.push(record);
    });
  }
  return bulkData;
}

module.exports = toBulkInsertArray;
