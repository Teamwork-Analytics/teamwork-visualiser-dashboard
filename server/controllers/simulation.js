const logger = require("winston");
const simulationService = require("../services/simulation");
const projectService = require("../services/project");
const obsService = require("../services/observation");
const { fillErrorObject } = require("../middleware/error");

/**
 * Create a new session
 * @param {*} req essayId
 * @param {*} res send newly created session object
 */
const createSimulation = async (req, res, next) => {
  try {
    // TODO: add assertions
    const { projectName } = req.body;
    // find project
    const project = await projectService.singleByName(projectName);

    // assemble & create
    const simulation = { ...req.body, project: project };
    const newSession = await simulationService.create(simulation);

    // create observation object
    const observation = await obsService.createWithDevices(project);
    newSession.observation = observation;
    await newSession.save();

    res.status(201).json(newSession);
  } catch (err) {
    return res
      .status(500)
      .send(fillErrorObject(500, "Unable to create a simulation", err));
  }
};

/**
 * Get all sessions
 * @param {*} req
 * @param {*} res
 */
const getAllSims = async (req, res, next) => {
  try {
    const allSessions = await simulationService.index();
    res.status(200).json(allSessions);
  } catch (err) {
    logger.error(err);
    return res
      .status(500)
      .send(fillErrorObject(500, "Unable to get all simulations", err));
  }
};

const getSimulation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await simulationService.single(id);
    res.status(200).json(session);
  } catch (err) {
    logger.error(err);
    return res
      .status(500)
      .send(fillErrorObject(500, "Unable to get a simulation", err));
  }
};

module.exports = {
  createSimulation,
  getSimulation,
  getAllSims,
};
