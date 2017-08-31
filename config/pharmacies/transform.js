
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/*
int getMinutesOffset(int dayCount, String time) {
  return 
     (1440 * dayCount) +
     (Integer.parseInt(time.substring(0,2)) * 60) +
     Integer.parseInt(time.substring(3,5));
}

String[] days = new String[] 
{ 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' } ;
ArrayList openingTimes = [];
if (ctx.openingTimes != null && ctx.openingTimes.general != null) {
  for (int d; d < days.length; d++) {
    String day = days[d];
    for (int i; i < ctx.openingTimes.general[day].length; i++) {
      int opens = getMinutesOffset(d, ctx.openingTimes.general[day][i].opens);
      int closes = getMinutesOffset(d, ctx.openingTimes.general[day][i].closes);
      openingTimes.add([ 'opens': opens, 'closes': closes ] );
    }
  }
}
ctx['openingTimesAsOffset'] = openingTimes;

ArrayList alterations = [];
if (ctx.openingTimes != null && ctx.openingTimes.alterations != null) {
  for (e in ctx.openingTimes.alterations.entrySet()) {
    for (int i; i < e.value.length; i++) {
      int opens = getMinutesOffset(0, e.value[i].opens);
      int closes = getMinutesOffset(0, e.value[i].closes);
      alterations.add([ 'date': e.key, 'opens': opens, 'closes': closes ] );
    }
  }
}
ctx['openingTimesAlterationsAsOffset'] = alterations;
ctx['openingTimes2'] = openingTimes;

*/
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

function flattenArray(arrayOfArrays) {
  return arrayOfArrays.reduce((a, b) => a.concat(b), []);
}

function getTimesAsOffset(section) {
  return flattenArray(days.map((day, index) => timesToMinutesSinceSunday(section[day], index)));
}

function addOffsetTimes(record) {
  if (record.openingTimes && record.openingTimes.general) {
    // eslint-disable-next-line no-param-reassign
    record.openingTimesAsOffset = getTimesAsOffset(record.openingTimes.general);
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
