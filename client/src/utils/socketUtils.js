/**
 * @file: socketUtils.js
 * @description: This module provides utility functions for preparing/sending/receiving data via Socket.IO.
 * Refer to https://socket.io/how-to/use-with-react for details.
 */

/**
 * Prepares data for tablet controller to send to projector. This function defines and enforces the data structure for the transmission.
 * It also stringifies the data object to ensure compatibility with Socket.IO transmission.
 * @param {int[]} range - The start time and end time of selected duration, in values of seconds.
 * @param {Object[]} visualisationSelected - A list of objects (up to 3), which are the visualisations chosen by the user.
 * @param {String} simId - The id of the simulation.
 * @returns {String} The prepared data in stringified format.
 */
function prepareData(
  range,
  visualisationSelected,
  simId,
  simDuration,
  timelineTags
) {
  const data = {
    range: range,
    vizSelected: visualisationSelected,
    simId: simId,
    simDuration: simDuration,
    timelineTags: timelineTags,
  };
  // Convert data to a JSON string for transmission.
  return JSON.stringify(data); // Do we need this? https://socket.io/docs/v3/emitting-events/
}

/**
 * Unpacks data received from Socket.IO transmission by parsing the received string back into an object. It also extracts and
 * structures the data as per application requirements.
 * @param {String} data - The received data in stringified format.
 * @returns {Object} The unpacked data in its original structure.
 */
function unpackData(data) {
  // Parse the received JSON string back into an object.
  const parsedData = JSON.parse(data);
  // Perform any additional processing you need here.
  return {
    range: parsedData.range,
    vizSelected: parsedData.vizSelected,
    simId: parsedData.simId,
    simDuration: parsedData.simDuration,
    timelineTags: parsedData.timelineTags,
  };
}

// Export the functions
module.exports = {
  prepareData,
  unpackData,
};
