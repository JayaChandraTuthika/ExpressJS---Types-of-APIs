const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

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
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API TO GET PLAYERS
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

//API TO ADD PLAYER
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_name,jersey_number,role)
    VALUES
      (
        '${playerName}',
         ${jerseyNumber},
         '${role}'
      );`;

  const dbResponse = await db.run(addPlayerQuery);
  const { lastId } = dbResponse.lastID;
  response.send("Player Added to Team");
});

//API TO GET PLAYER DETAILS
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  const dbResponse = await db.get(getPlayerQuery);
  let { player_id, player_name, jersey_number, role } = dbResponse;
  const playerDetails = {
    playerId: player_id,
    playerName: player_name,
    jerseyNumber: jersey_number,
    role: role,
  };
  response.send(playerDetails);
});

//API TO UPDATE PLAYER DETAILS
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE cricket_team
     SET 
       player_name = '${playerName}',
       jersey_number = '${jerseyNumber}',
       role = '${role}'
     WHERE 
        player_id = ${playerId}`;
  const dbResponse = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API TO DELETE PLAYER

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  const dbResponse = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
