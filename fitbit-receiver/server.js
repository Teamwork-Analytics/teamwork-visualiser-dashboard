require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const os = require("os");
const app = express();
const port = 3168; // Use non-standard port to avoid conflicts (web server is on 3000)
const dataHandler = require("./dataHandler");

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // for parsing application/json

let simulationId = null;

const mongoUri = process.env.IP_ATLAS_URI;

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB connected...");
    updateIpAddress(); // Call updateIpAddress here after the connection is established
  })
  .catch((err) => console.log(err));

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const iface = interfaces[interfaceName];
    for (const alias of iface) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address;
      }
    }
  }
  return null;
}

const ipAddress = getLocalIpAddress();
const deviceId = "main-server";

async function updateIpAddress() {
  try {
    const db = mongoose.connection.db;
    await db
      .collection("ipaddresses")
      .updateOne({ deviceId }, { $set: { ipAddress } }, { upsert: true });
    console.log(`Updated IP address to ${ipAddress}`);
  } catch (error) {
    console.error("Error updating IP address:", error);
  }
}

app.post("/start-simulation", (req, res) => {
  simulationId = req.body.simulationId;
  console.log("Fitbit server Received simulationId:", simulationId);
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
  console.log(`Fitbit - Server listening at port ${port}`);
});
