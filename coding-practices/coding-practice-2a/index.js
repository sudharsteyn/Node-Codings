var addDays = require("date-fns/addDays");

const fixDate = new Date(2020, 7, 22);

function calcDays(days) {
  const newDate = addDays(fixDate, days);
  return `${newDate.getDate()}-${
    newDate.getMonth() + 1
  }-${newDate.getFullYear()}`;
}

module.exports = calcDays;
