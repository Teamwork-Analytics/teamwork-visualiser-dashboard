require("dotenv").config({ path: "../.env" });
const express = require('express');
const cors = require("cors");
const mongoose = require("mongoose");
const Busboy = require('@fastify/busboy')

const os = require("node:os");
const fs = require("fs");

const app = express();
const port = 3168; // Use non-standard port to avoid conflicts (web server is on 3000)
const dataHandler = require("./dataHandler");

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // for parsing application/json

let simulationId = null;

//const mongoUri = process.env.IP_MONGODB_URI; // TODO REMOVE

//mongoose
//  .connect(mongoUri)
//  .then(() => {
//    console.log("MongoDB connected...");
//    updateIpAddress(); // Call updateIpAddress here after the connection is established
//  })
//  .catch((err) => console.log(err));
//
//function getLocalIpAddress() {
//  const interfaces = os.networkInterfaces();
//  for (const interfaceName in interfaces) {
//    const iface = interfaces[interfaceName];
//    for (const alias of iface) {
//      if (alias.family === "IPv4" && !alias.internal) {
//        return alias.address;
//      }
//    }
//  }
//  return null;
//}

const ipAddress = "192.168.20.5";
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
    console.warn(
      "Data received but no active simulationId from dashboard, did you start the simulation?"
    );
    simulationId = "unknown_simulation_id";
  }
  console.log("Received data:", req.body);
  dataHandler.handleReceivedData(req.body, simulationId);
  res.status(200).send("Data received");
});

// This should be the proper API call. Using API design. simulation/:id/audio-recordings.
app.get("/api/simulations/:simulationId/audio-recordings", (req, res) => {
  res.status(200).send("here we are!");
});

app.post("/api/simulations/:simulationId/audio-recordings", (req, res) => {

  const codeStatus = {
    400: "Data received is incomplete. Check sent data.",
    200: "Audio received",
    500: "Failed to store Data",
  }

  const handlingError = (currentStatus, simulationId) => {
    res.writeHead(currentStatus, { 'Connection': 'close' });
    res.end(codeStatus[currentStatus] + simulationId);
  };

  // To receive the data using the API call we should use formdata.
  const busboy = new Busboy({ headers: req.headers });
  const { simulationId } = req.params;

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log('File received' + filename);
    
    file.on('end', () => {
        console.log(`File [${fieldname}] Finished`);
        handlingError(200, simulationId);
    });

    file.pipe(dataHandler.handleAudioData(simulationId)(filename));

  });
  busboy.on('error', (error) => {
    console.log('Error here', error);
    handlingError(500, simulationId);
  });
  
  // return req.pipe(busboy);
  return req.pipe(busboy);

});

app.listen(port, () => {
  console.log(`Fitbit - Server listening at port ${port}`);
});
