const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const changeDBObjectToResponseObject = (DBObject) => {
  return {
    movieId: DBObject.movie_id,
    directorId: DBObject.director_id,
    movieName: DBObject.movie_name,
    leadActor: DBObject.lead_actor,
  };
};

//GET Movies Name API
app.get("/movies/", async (req, res) => {
  const getMoviesNameQuery = `
    SELECT movie_name
    FROM movie;
    `;
  const moviesNameArray = await db.all(getMoviesNameQuery);
  const responseBody = [];
  for (let movie of moviesNameArray) {
    responseBody.push({ movieName: movie.movie_name });
  }
  res.send(responseBody);
});

//ADD Movie API
app.post("/movies/", async (req, res) => {
  const movieDetails = req.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');
    `;
  await db.run(addMovieQuery);
  res.send("Movie Successfully Added");
});

//GET Movie API
app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const getMovieQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId};
    `;
  const movieDetails = await db.get(getMovieQuery);
  const responseBody = changeDBObjectToResponseObject(movieDetails);
  res.send(responseBody);
});

//UPDATE Movie API
app.put("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const movieDetails = req.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE movie
    SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};
    `;
  await db.run(updateMovieQuery);
  res.send("Movie Details Updated");
});

//REMOVE Movie API
app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  res.send("Movie Removed");
});

//GET Directors API
app.get("/directors/", async (req, res) => {
  const getDirectorsQuery = `
    SELECT *
    FROM director;
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  const responseBody = [];
  for (let director of directorsArray) {
    responseBody.push({
      directorId: director.director_id,
      directorName: director.director_name,
    });
  }
  res.send(responseBody);
});

//GET Directors Movies API
app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const getDirectorMoviesQuery = `
    SELECT movie_name
    FROM movie
    WHERE director_id = ${directorId};
    `;
  const directorMoviesArray = await db.all(getDirectorMoviesQuery);
  const responseBody = [];
  for (let directorMovie of directorMoviesArray) {
    responseBody.push({ movieName: directorMovie.movie_name });
  }
  res.send(responseBody);
});

module.exports = app;
