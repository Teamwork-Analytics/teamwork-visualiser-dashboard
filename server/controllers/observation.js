const logger = require("winston");
const simService = require("../services/simulation");
const observationService = require("../services/observation");

const { fillErrorObject } = require("../middleware/error");

const getObservation = async (req, res, next) => {
  try {
    const { simulationId } = req.params;
    const simulation = await simService.singleBySimulationId(simulationId);
    const observation = await observationService.single(simulation.observation);

    return res.status(200).json(observation);
  } catch (err) {
    return res
      .status(500)
      .send(fillErrorObject(500, "Unable to get observation data", err));
  }
};

const recordSimTime = async (req, res, next) => {
  try {
    const { observationId } = req.params;
    const { type, timeString } = req.body;

    const data = {
      [type]: new Date(timeString),
    };
    const updatedObs = await observationService.update(observationId, data);
    return res.status(200).json(updatedObs);
  } catch (err) {
    return res
      .status(500)
      .send(
        fillErrorObject(
          500,
          "Unable to record a timestamp for the observation!",
          err
        )
      );
  }
};

const resetObservation = async (req, res, next) => {
  try {
    const { observationId } = req.params;

    //reset all synchronisations time
    await observationService.resetSyncTime(observationId);

    //reset all time + phases
    const updatedData = {
      baselineTime: null,
      startTime: null,
      stopTime: null,
      phases: [],
    };
    const updatedObs = await observationService.update(
      observationId,
      updatedData
    );

    return res.status(200).json(updatedObs);
  } catch (err) {
    return res
      .status(500)
      .send(
        fillErrorObject(
          500,
          "Unable to reset all recorded time and notes in observation",
          err
        )
      );
  }
};

const recordNote = async (req, res, next) => {
  try {
    const { observationId } = req.params;
    const updatedObs = await observationService.addPhaseNote(
      observationId,
      req.body
    );
    return res.status(200).json(updatedObs);
  } catch (err) {
    return res
      .status(500)
      .send(
        fillErrorObject(
          500,
          "Unable to record a note for a phase in observation",
          err
        )
      );
  }
};
const syncDeviceTime = async (req, res, next) => {
  try {
    const { observationId } = req.params;
    const { deviceId, timeString } = req.body;
    const data = {
      deviceId: deviceId,
      syncTime: new Date(timeString),
    };
    const updatedObs = await observationService.synchroniseDevice(
      observationId,
      data
    );
    return res.status(200).json(updatedObs);
  } catch (err) {
    return res
      .status(500)
      .send(
        fillErrorObject(
          500,
          "Unable to record a synchronised time for a device",
          err
        )
      );
  }
};

const deletePhaseNote = async (req, res, next) => {
  try {
    const { observationId, noteId } = req.params;
    const currentNotes = await observationService.deleteNote(
      observationId,
      noteId
    );
    return res.status(200).json(currentNotes);
  } catch (err) {
    return res
      .status(500)
      .send(
        fillErrorObject(
          500,
          "Unable to delete a note/phase from the observation",
          err
        )
      );
  }
};

module.exports = {
  getObservation,
  recordNote,
  deletePhaseNote,
  recordSimTime,
  syncDeviceTime,
  resetObservation,
};
