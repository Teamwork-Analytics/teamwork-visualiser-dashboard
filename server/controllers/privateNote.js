/**
 * @file controllers/privateNotes.js
 * @description Controller for handling operations related to the 'privateNote' resource.
 */

const logger = require("winston");
const simService = require("../services/simulation");
const privateNoteService = require("../services/privateNote");
const { fillErrorObject } = require("../middleware/error");

const getPrivateNote = async (req, res) => {
  try {
    const { simulationId } = req.params;
    const simulation = await simService.singleBySimulationId(simulationId);

    // Ensure the PrivateNote is loaded for this Simulation
    if (simulation && simulation.privateNote) {
      res.status(200).json(simulation.privateNote);
    } else {
      // Handle scenario where simulation or private note does not exist
      res
        .status(404)
        .json(fillErrorObject(404, "Private note not found", null));
    }
  } catch (err) {
    logger.error(err);
    res
      .status(500)
      .json(fillErrorObject(500, "Error getting private note", err));
  }
};

const updatePrivateNote = async (req, res) => {
  try {
    const { simulationId } = req.params;
    const simulation = await simService.singleBySimulationId(simulationId);

    // Update the PrivateNote if it exists
    if (simulation && simulation.privateNote) {
      const updatedPrivateNote = await privateNoteService.update(
        simulation.privateNote._id,
        req.body
      );
      res.status(200).json(updatedPrivateNote);
    } else {
      // Handle scenario where simulation or private note does not exist
      res
        .status(404)
        .json(fillErrorObject(404, "Private note not found", null));
    }
  } catch (err) {
    logger.error(err);
    res
      .status(500)
      .json(fillErrorObject(500, "Error updating private note", err));
  }
};

module.exports = {
  getPrivateNote,
  updatePrivateNote,
};
