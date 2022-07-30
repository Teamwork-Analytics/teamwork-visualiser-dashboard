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

module.exports = { getObservation };
