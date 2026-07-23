const { createObjectCsvWriter } = require("csv-writer");
const fs = require("fs");
const path = require("path");

// Resolves where a simulation's file should live, under VISUALISATION_DIR (set in ../.env)
function getSimulationFilePath(simulationId, filename) {
  return path.join(process.env.VISUALISATION_DIR, simulationId, filename);
}

// Function to write data to CSV
function writeToCsv(filePath, data, header) {
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    append: fs.existsSync(filePath), // Append data if file exists (setting true will disable headers)
    header,
  });

  csvWriter.writeRecords([data]);
}

// Function to handle received sensor data
function handleReceivedData(receivedData, simulationId) {
  const filename = `${receivedData.type.toLowerCase()}-${receivedData.user.toUpperCase()}.csv`;
  const filePath = getSimulationFilePath(simulationId, filename);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const dataForCsv = {
    server_time: new Date().toISOString(),
    watch_timestamp: receivedData.timestamp,
    value: receivedData.value || null,
  };

  writeToCsv(filePath, dataForCsv, [
    { id: "server_time", title: "Server Time" },
    { id: "watch_timestamp", title: "Watch Timestamp" },
    { id: "value", title: "Value" }, // For heart rate
  ]);
}

// Returns a writable stream for an audio chunk uploaded for this simulation
function handleAudioData(simulationId) {
  return function (filename) {
    const filePath = getSimulationFilePath(simulationId, filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    return fs.createWriteStream(filePath);
  };
}

// Function to handle a button-click response coming back from a watch.
// The middleman already knows its simulationId (same as handleReceivedData/
// handleAudioData above), so it's carried in the WS payload here rather than
// relying on the /start-simulation global.
function handleButtonResponse(deviceId, responseData) {
  const simulationId = responseData.simulationId || "unknown_simulation_id";
  const filename = `button-response-${deviceId}.csv`;
  const filePath = getSimulationFilePath(String(simulationId), filename);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const dataForCsv = {
    server_time: new Date().toISOString(),
    device_id: deviceId,
    watch_timestamp: responseData.timestamp || null,
    button: responseData.button || null,
    message: responseData.message || null,
  };

  writeToCsv(filePath, dataForCsv, [
    { id: "server_time", title: "Server Time" },
    { id: "device_id", title: "Device Id" },
    { id: "watch_timestamp", title: "Watch Timestamp" },
    { id: "button", title: "Button" },
    { id: "message", title: "Message" },
  ]);
}

exports.handleReceivedData = handleReceivedData;
exports.handleAudioData = handleAudioData;
exports.handleButtonResponse = handleButtonResponse;
