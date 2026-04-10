import { createObjectCsvWriter } from 'csv-writer';
import { join, dirname } from 'path';
import { mkdirSync, existsSync, createWriteStream, access, constants } from 'fs';

/**
 * All the following functions are curryied version. 
 * They can be composed using the pipe function.
 */

const pipe = (...fns) => (arg) => fns.reduce((acc, fn) => fn(acc), arg);

const getUploadFilePath = simulationId => filename => {
    return join(
    process.env.VISUALISATION_DIR,
    simulationId,
    filename
  ); // Absolute path for data collection
}

const makeDirectorySync = filePath => {
  mkdirSync(dirname(filePath), { recursive: true });
  return filePath;
}

// Function to write data to CSV
const writeToCsv = data => filePath => {
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    append: existsSync(filePath), // Append data if file exists (setting true will disable headers)
    header: [
      { id: "server_time", title: "Server Time" },
      { id: "watch_timestamp", title: "Watch Timestamp" },
      { id: "value", title: "Value" }, // For heart rate
    ],
  });

  // Check if file exists to decide on writing headers
  access(filename, constants.F_OK, (err) => {
    csvWriter.writeRecords([data]);
  });
}

// Function to handle fitbit received data
const handleReceivedData = receivedData => simulationId => {
  const filename = `${receivedData.type.toLowerCase()}-${receivedData.user.toUpperCase()}.csv`;

  // Prepare the data object for CSV
  // TODO, check how to keep new Date() synchronised in the whole platform.
  const dataForCsv = {
    server_time: new Date().toISOString(),
    watch_timestamp: receivedData.timestamp,
    value: receivedData.value || null,
  };

  const getPathSimulationId = getUploadFilePath(simulationId);
  const writetoCsvWithData = writeToCsv(dataForCsv);
  const handleReceivedDataFunction = pipe(getPathSimulationId, makeDirectorySync, writetoCsvWithData);

  handleReceivedDataFunction(filename);

}

// Function to handle audio received data
const handleAudioData = simulationId => filename => {

  const getPathSimulationId = getUploadFilePath(simulationId);
  const composedFunction = pipe(getPathSimulationId, makeDirectorySync);
  const curatedFilePath = composedFunction(filename);

  return createWriteStream(curatedFilePath);
}

export { handleReceivedData, getUploadFilePath, handleAudioData };
