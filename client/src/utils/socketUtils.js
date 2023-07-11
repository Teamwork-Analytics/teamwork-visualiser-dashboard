/**
 * @file: socketUtils.js
 * @description: This module provides utility functions for preparing/sending/receiving data via Socket.IO.
 */

/**
 * Prepares data for tablet controller to send to projector. This function define and enforce the data structure for the transmission.
 * @param {Array} range - The start time and end time of selected duration, in values of seconds.
 * @param {Array} visualisationSelected - A list of objects (up to 3), which is the visualisation, chosen by the user.
 * @param {String} simId - The id of the simulation.
 * @returns {Object} The prepared data.
 */
function prepareData(range, visualisationSelected, simId) {
  return {
    range: range,
    vizSelected: visualisationSelected,
    simId: simId,
  };
}

// Export the functions
module.exports = {
  prepareData,
};
