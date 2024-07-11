const { createObjectCsvWriter } = require("csv-writer");
const fs = require("fs");
const path = require("path");

// Function to write data to CSV
function writeToCsv(filename, data) {
  const csvWriter = createObjectCsvWriter({
    path: filename,
    append: fs.existsSync(filename), // Append data if file exists (setting true will disable headers)
    header: [
      { id: "server_time", title: "Server Time" },
      { id: "watch_timestamp", title: "Watch Timestamp" },
      { id: "value", title: "Value" }, // For heart rate
    ],
  });

  // Check if file exists to decide on writing headers
  fs.access(filename, fs.constants.F_OK, (err) => {
    csvWriter.writeRecords([data]);
  });
}

// Function to handle received data
function handleReceivedData(receivedData, simulationId) {
  const filename = `${receivedData.type.toLowerCase()}-${receivedData.user.toLowerCase()}.csv`;

  // const filePath = path.join(
  //   `/Users/jiexiangfan/Documents/GitHub/teamwork-visualiser-dashboard/server/saved_data/${simulationId}/result/`,
  //   filename
  // ); 
  
  // Absolute path of developer
  const filePath = path.join(`C:\\develop\\saved_data\\${simulationId}\\result\\`, filename); // Absolute path for data collection

  // Ensure directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  // Prepare the data object for CSV
  const dataForCsv = {
    server_time: new Date().toISOString(),
    watch_timestamp: receivedData.timestamp,
    value: receivedData.value || null,
  };

  writeToCsv(filePath, dataForCsv);
}

exports.handleReceivedData = handleReceivedData;
