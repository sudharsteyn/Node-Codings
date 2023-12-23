const express = require("express");
const app = express();

app.get("/date", (request, response) => {
  let newDate = new Date();
  response.send(`Today's date is ${newDate}`);
});

app.get("/page", (request, response) => {
  response.sendFile("./page.html", { root: __dirname });
});

console.log(app);

app.listen(3000);
