const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

let db = null;
const dbpath = path.join(__dirname, "goodreads.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/books", async (req, res) => {
  const getBookQuery = `
    SELECT *
    FROM book
    ORDER BY book_id;
    `;
  const bookArray = await db.all(getBookQuery);
  res.send(bookArray);
});
