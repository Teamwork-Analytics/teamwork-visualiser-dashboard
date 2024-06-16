const express = require("express");
const cors = require("cors");
const app = express();
const port = 3168; // Use non-standard port to avoid conflicts (web server is on 3000)
const dataHandler = require("./dataHandler");

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // for parsing application/json

let simulationId = null;

// Endpoint to receive the simulationId
app.post("/start-simulation", (req, res) => {
  simulationId = req.body.simulationId;
  console.log("Received simulationId:", simulationId);
  res.status(200).send("Simulation ID received");
});

// Endpoint to stop the simulation and clear the simulationId
app.post("/stop-simulation", (req, res) => {
  if (!simulationId) {
    res.status(400).send("No active simulation to stop");
    return;
  }
  console.log("Stopping simulation with ID:", simulationId);
  simulationId = null;
  res.status(200).send("Simulation stopped and ID cleared");
});

app.post("/data", (req, res) => {
  if (!simulationId) {
    res
      .status(400)
      .send("Simulation ID not received OR simulation not started yet");
    return;
  }
  console.log("Received data:", req.body);
  dataHandler.handleReceivedData(req.body, simulationId);
  res.status(200).send("Data received");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
