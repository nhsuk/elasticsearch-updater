
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function getMinutesOffset(dayCount, time) {
  return (1440 * dayCount) +
    (Number(time.substring(0, 2)) * 60) +
    Number(time.substring(3, 5));
}

function timesToMinutesSinceSunday(day, index) {
  // eslint-disable-next-line
  return day.map(times => {
    return {
      opens: getMinutesOffset(index, times.opens),
      closes: getMinutesOffset(index, times.closes)
    };
  });
}

function altTimesToMinutesSinceMidnight(date, sessions) {
  // eslint-disable-next-line
  return sessions.map(session => {
    return {
      date,
      opens: getMinutesOffset(0, session.opens),
      closes: getMinutesOffset(0, session.closes)
    };
  });
}

function flattenArray(arrayOfArrays) {
  return arrayOfArrays.reduce((a, b) => a.concat(b), []);
}

function getTimesAsOffset(section) {
  if (section) {
    return flattenArray(days.map((day, index) => timesToMinutesSinceSunday(section[day], index)));
  }
  return [];
}

function getAltTimesAsOffset(section) {
  const altTimes = [];
  // simple object we've created, no need to worry about extra keys
  // eslint-disable-next-line 
  for (const date in section) {
    const sessionTimes = altTimesToMinutesSinceMidnight(date, section[date]);
    altTimes.push(sessionTimes);
  }
  return flattenArray(altTimes);
}

function addOffsetTimes(record) {
  if (record.openingTimes) {
    // eslint-disable-next-line no-param-reassign
    record.openingTimesAsOffset = getTimesAsOffset(record.openingTimes.general);
    // eslint-disable-next-line no-param-reassign
    record.openingTimesAlterationsAsOffset = getAltTimesAsOffset(record.openingTimes.alterations);
  }
  return record;
}

function transform(data) {
  if (data) {
    return data.map(addOffsetTimes);
  }
  return data;
}

module.exports = transform;
