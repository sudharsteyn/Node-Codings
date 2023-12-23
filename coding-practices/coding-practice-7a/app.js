const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const changePlayerDBObjectToResponseObject = (DBObject) => {
  return {
    playerId: DBObject.player_id,
    playerName: DBObject.player_name,
  };
};

const changeMatchDBObjectToResponseObject = (DBObject) => {
  return {
    matchId: DBObject.match_id,
    match: DBObject.match,
    year: DBObject.year,
  };
};

//GET players API 1
app.get("/players/", async (req, res) => {
  const getPlayersQuery = `
    SELECT *
    FROM player_details;`;
  const playersArray = await db.all(getPlayersQuery);
  res.send(
    playersArray.map((eachPlayer) =>
      changePlayerDBObjectToResponseObject(eachPlayer)
    )
  );
});

//GET player API 2
app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerQuery = `
    SELECT *
    FROM player_details
    WHERE player_id = ${playerId};`;
  const playerDetail = await db.get(getPlayerQuery);
  res.send(changePlayerDBObjectToResponseObject(playerDetail));
});

//UPDATE Player API 3
app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const playerDetail = req.body;
  const { playerName } = playerDetail;
  const updatePlayerQuery = `
  UPDATE player_details
  SET player_name = '${playerName}'
  WHERE player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

//GET Match API 4
app.get("/matches/:matchId/", async (req, res) => {
  const { matchId } = req.params;
  const getMatchQuery = `
    SELECT *
    FROM match_details
    WHERE match_id = ${matchId};`;
  const matchDetail = await db.get(getMatchQuery);
  res.send(changeMatchDBObjectToResponseObject(matchDetail));
});

//GET Player Matches API 5
app.get("/players/:playerId/matches", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerMatchesQuery = `
    SELECT *
    FROM match_details NATURAL JOIN player_match_score
    WHERE player_id = ${playerId};`;
  const playerMatchDetails = await db.all(getPlayerMatchesQuery);
  res.send(
    playerMatchDetails.map((eachMatch) =>
      changeMatchDBObjectToResponseObject(eachMatch)
    )
  );
});

//GET Match Players API 6
app.get("/matches/:matchId/players", async (req, res) => {
  const { matchId } = req.params;
  const getMatchPlayersQuery = `
    SELECT *
    FROM player_details NATURAL JOIN player_match_score
    WHERE match_id = ${matchId};`;
  const matchPlayersDetail = await db.all(getMatchPlayersQuery);
  res.send(
    matchPlayersDetail.map((eachPlayer) =>
      changePlayerDBObjectToResponseObject(eachPlayer)
    )
  );
});

//GET Player Statistics API 7
app.get("/players/:playerId/playerScores/", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerStatisticsQuery = `
    SELECT player_id AS playerId,
    player_name AS playerName,
    SUM(score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes
    FROM player_details NATURAL JOIN player_match_score
    WHERE player_id = ${playerId}
    GROUP BY player_id;`;
  const playerStatistics = await db.get(getPlayerStatisticsQuery);
  res.send(playerStatistics);
});

module.exports = app;
