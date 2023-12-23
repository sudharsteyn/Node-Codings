const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

//GET todos API 1
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

//GET todo API 2
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const getTodoQuery = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  res.send(todo);
});

//ADD todo API 3
app.post("/todos/", async (req, res) => {
  const todoDetails = req.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodoQuery = `
    INSERT INTO todo
    VALUES (${id},"${todo}","${priority}","${status}");`;
  await db.run(addTodoQuery);
  res.send("Todo Successfully Added");
});

//UPDATE todo API 4
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  let responseMessage = "";
  const getPreviousTodoQuery = `
  SELECT *
  FROM todo
  WHERE id = ${todoId};`;
  const previousTodo = await db.get(getPreviousTodoQuery);
  const todoDetails = req.body;
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = todoDetails;
  switch (true) {
    case todoDetails.status !== undefined:
      responseMessage = "Status";
      break;
    case todoDetails.priority !== undefined:
      responseMessage = "Priority";
      break;
    case todoDetails.todo !== undefined:
      responseMessage = "Todo";
      break;
  }
  const updateTodoQuery = `
  UPDATE todo
  SET
  todo = "${todo}",
  priority = "${priority}",
  status = "${status}"
  WHERE id = ${todoId};`;
  await db.run(updateTodoQuery);
  res.send(`${responseMessage} Updated`);
});

//DELETE todo API 5
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  res.send("Todo Deleted");
});

module.exports = app;
