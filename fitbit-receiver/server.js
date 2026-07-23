require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const Busboy = require("@fastify/busboy");
const path = require("path");
const http = require("http");
const app = express();
const port = 3168; // Use non-standard port to avoid conflicts (web server is on 3000)
const dataHandler = require("./dataHandler");
const { createHub } = require("./wsHub");

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // for parsing application/json
app.use(express.static(path.join(__dirname, "public")));

const httpServer = http.createServer(app);
const hub = createHub(httpServer);
hub.onButtonResponse((deviceId, payload) => {
  console.log(`Button response from ${deviceId}:`, payload);
  dataHandler.handleButtonResponse(deviceId, payload);
});

let simulationId = null;

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

// Kept for compatibility with older middleman builds that don't yet send
// the simulationId themselves; relies on the fragile /start-simulation global.
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

// Preferred route: the middleman already knows its simulationId (same as
// api/simulations/:simulationId/audio-recordings), so it's carried in the
// URL instead of relying on the /start-simulation global above.
app.post("/api/simulations/:simulationId/data", (req, res) => {
  console.log("Received data:", req.body);
  dataHandler.handleReceivedData(req.body, req.params.simulationId);
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
  };

  const handlingError = (currentStatus, simulationId) => {
    res.writeHead(currentStatus, { Connection: "close" });
    res.end(codeStatus[currentStatus] + simulationId);
  };

  // To receive the data using the API call we should use formdata.
  const busboy = new Busboy({ headers: req.headers });
  const { simulationId } = req.params;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    console.log("File received" + filename);

    file.on("end", () => {
      console.log(`File [${fieldname}] Finished`);
      handlingError(200, simulationId);
    });

    file.pipe(dataHandler.handleAudioData(simulationId)(filename));
  });
  busboy.on("error", (error) => {
    console.log("Error here", error);
    handlingError(500, simulationId);
  });

  return req.pipe(busboy);
});

// Lists currently connected Android devices, used by the /notify form
app.get("/api/devices", (req, res) => {
  res.status(200).json({ devices: hub.listConnectedDevices() });
});

// Sends a message to one device (target === deviceId) or all connected devices (target === "all")
app.post("/api/notify", (req, res) => {
  const { target, message } = req.body;

  if (!message || !target) {
    res.status(400).send("target and message are required");
    return;
  }

  if (target === "all") {
    const targeted = hub.broadcastMessage(message);
    res.status(200).json({ sentTo: targeted });
    return;
  }

  const delivered = hub.sendMessageTo(target, message);
  if (!delivered) {
    res.status(404).send(`Device ${target} is not connected`);
    return;
  }
  res.status(200).json({ sentTo: [target] });
});

httpServer.listen(port, () => {
  console.log(`Fitbit - Server listening at port ${port}`);
});
