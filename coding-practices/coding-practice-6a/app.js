const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

//Initialize DB And Server
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

//Convert State DB to Response DB
const changeStateDBToResponseDB = (stateObject) => {
  return {
    stateId: stateObject.state_id,
    stateName: stateObject.state_name,
    population: stateObject.population,
  };
};

//Convert District DB to Response DB
const changeDistrictDBToResponseDB = (districtObject) => {
  return {
    districtId: districtObject.district_id,
    districtName: districtObject.district_name,
    stateId: districtObject.state_id,
    cases: districtObject.cases,
    cured: districtObject.cured,
    active: districtObject.active,
    deaths: districtObject.deaths,
  };
};

//GET States API 1
app.get("/states/", async (req, res) => {
  const getStatesQuery = `
    SELECT *
    FROM state;
    `;
  const statesArray = await db.all(getStatesQuery);
  const responseBody = [];
  for (let eachState of statesArray) {
    responseBody.push(changeStateDBToResponseDB(eachState));
  }
  res.send(responseBody);
});

//Get State API 2
app.get("/states/:stateId/", async (req, res) => {
  const { stateId } = req.params;
  const getStateQuery = `
    SELECT *
    FROM state
    WHERE state_id = ${stateId};
    `;
  const stateDetails = await db.get(getStateQuery);
  const responseBody = changeStateDBToResponseDB(stateDetails);
  res.send(responseBody);
});

//ADD Districts API 3
app.post("/districts/", async (req, res) => {
  const districtDetails = req.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `
    INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
    VALUES ('${districtName}',${stateId},${cases},${cured},${active},${deaths});
    `;
  await db.run(addDistrictQuery);
  res.send("District Successfully Added");
});

//GET District API 4
app.get("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const getDistrictQuery = `
    SELECT *
    FROM district
    WHERE district_id = ${districtId};
    `;
  const districtDetails = await db.get(getDistrictQuery);
  const responseBody = changeDistrictDBToResponseDB(districtDetails);
  res.send(responseBody);
});

//DELETE District API 5
app.delete("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const deleteDistrictQuery = `
    DELETE FROM district
    WHERE district_id = ${districtId};
    `;
  await db.run(deleteDistrictQuery);
  res.send("District Removed");
});

//UPDATE District API 6
app.put("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const districtDetails = req.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictQuery = `
    UPDATE district
    SET
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
    WHERE district_id = ${districtId};
    `;
  await db.run(updateDistrictQuery);
  res.send("District Details Updated");
});

//GET State Stats API 7
app.get("/states/:stateId/stats/", async (req, res) => {
  const { stateId } = req.params;
  const getStateStatsQuery = `
    SELECT SUM(cases) AS total_cases,
    SUM(cured) AS total_cured,
    SUM(active) AS total_active,
    SUM(deaths) AS total_deaths
    FROM district
    WHERE state_id = ${stateId}
    GROUP BY state_id;
    `;
  const stateStats = await db.get(getStateStatsQuery);
  res.send({
    totalCases: stateStats.total_cases,
    totalCured: stateStats.total_cured,
    totalActive: stateStats.total_active,
    totalDeaths: stateStats.total_deaths,
  });
});

//GET StateName On District API 8
app.get("/districts/:districtId/details/", async (req, res) => {
  const { districtId } = req.params;
  const getDistrictStateNameQuery = `
    SELECT state_name
    FROM state NATURAL JOIN district
    WHERE district_id = ${districtId};
    `;
  const stateName = await db.get(getDistrictStateNameQuery);
  res.send({ stateName: stateName.state_name });
});

module.exports = app;
