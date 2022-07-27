const logger = require("winston");
const sessionService = require("../services/session");
const projectService = require("../services/project");
const obsService = require("../services/observation");
const { fillErrorObject } = require("../middleware/error");

/**
 * Create a new session
 * @param {*} req essayId
 * @param {*} res send newly created session object
 */
const createSession = async (req, res, next) => {
  try {
    // TODO: add assertions
    const { projectName } = req.body;
    // find project
    const project = await projectService.singleByName(projectName);

    // assemble & create
    const session = { ...req.body, project: project };
    const newSession = await sessionService.create(session);

    // create observation object
    const observation = await obsService.createWithEmpaticas(project);
    newSession.observation = observation;
    await newSession.save();

    res.status(201).json(newSession);
  } catch (err) {
    return res.send(fillErrorObject(500, "Unable to create a session", err));
  }
};

/**
 * Get all sessions
 * @param {*} req
 * @param {*} res
 */
const getAllSessions = async (req, res, next) => {
  try {
    const allSessions = await sessionService.index();
    res.status(200).json(allSessions);
  } catch (err) {
    logger.error(err);
    return res.send(fillErrorObject(500, "Unable to get all sessions", err));
  }
};

const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await sessionService.single(id);
    res.status(200).json(session);
  } catch (err) {
    logger.error(err);
    return res.send(fillErrorObject(500, "Unable to get all sessions", err));
  }
};

module.exports = { createSession, getSession, getAllSessions };
