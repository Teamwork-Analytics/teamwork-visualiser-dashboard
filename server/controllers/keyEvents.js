const logger = require("winston");
const projectService = require("../services/project");
const keyEventService = require("../services/keyEvent");
const { fillErrorObject } = require("../middleware/error");

/**
 * Create a new key event
 * @param {*} req essayId
 * @param {*} res send newly created session object
 */
const createKeyEvent = async (req, res, next) => {
  try {
    const newKeyEvent = await keyEventService.create(req.body);
    return res.status(201).json(newKeyEvent);
  } catch (err) {
    logger.error(err);
    return res
      .status(500)
      .send(fillErrorObject(500, "Unable to create keyEvent", err));
  }
};

const getAllProjects = async (req, res, next) => {
  try {
    const allProjects = await projectService.index();
    res.status(200).json(allProjects);
  } catch (err) {
    return res
      .status(500)
      .send(fillErrorObject(500, "Unable to retrieve all projects", err));
  }
};

const registerDevices = async (req, res, next) => {
  try {
    const { id, devices } = req.body;
    const updatedProject = await projectService.registerDevices(id, devices);
    return res.status(201).json(updatedProject);
  } catch (err) {
    return res
      .status(500)
      .send(fillErrorObject(500, "Unable to register devices", err));
  }
};

module.exports = { createProject, getAllProjects, registerDevices };
