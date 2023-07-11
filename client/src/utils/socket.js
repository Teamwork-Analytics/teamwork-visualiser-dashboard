/**
 * @file: socket.js
 * @description: This module provides utility functions for preparing/sending/receiving data via Socket.IO.
 */

// Import the socket.io client library.
// Note: You will need to install this library using npm if you haven't already done so.
const io = require("socket.io-client");

/**
 * Prepares data for transmission via Socket.IO.
 * @param {Array} range - The start time and end time of selected duration.
 * @param {Array} visualisationSelected - A list of objects (up to 3), which is the visualisation, chosen by the user.
 * @param {String} simId - The id of the simulation.
 * @returns {Object} The prepared data.
 */
function prepareData(range, visualisationSelected, simId) {
  return {
    range: range,
    visualisationSelected: visualisationSelected,
    simId: simId,
  };
}

/**
 * Sends data over a Socket.IO connection.
 * @param {Object} socket - The Socket.IO connection.
 * @param {Object} data - The data to send.
 */
function sendData(socket, data) {
  socket.emit("data", data);
}

/**
 * Initializes and returns a Socket.IO connection.
 * @param {String} url - The URL of the Socket.IO server.
 * @returns {Object} The initialized Socket.IO connection.
 */
function initSocket(url) {
  const socket = io(url);

  // Add error handling for the socket connection.
  socket.on("connect_error", (err) => {
    console.log(`Connection error: ${err.message}`);
  });

  return socket;
}

// Export the functions so that they can be used in other modules.
module.exports = {
  prepareData,
  sendData,
  initSocket,
};
