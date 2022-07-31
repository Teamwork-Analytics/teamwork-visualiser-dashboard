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

    const data =
      type === "reset"
        ? { baselineTime: null, startTime: null, stopTime: null }
        : {
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

module.exports = { getObservation, recordNote, recordSimTime, syncDeviceTime };
