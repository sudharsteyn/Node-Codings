const express = require("express");
const addDays = require("date-fns/addDays");
const app = express();

app.get("/", (req, res) => {
  const date = new Date();
  const after100days = addDays(date, 100);
  res.send(
    `${after100days.getDate()}/${
      after100days.getMonth() + 1
    }/${after100days.getFullYear()}`
  );
});

module.exports = app;
