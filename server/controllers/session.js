const logger = require("winston");
const sessionService = require("../services/session");

/**
 * Create a new session
 * @param {*} req essayId
 * @param {*} res send newly created session object
 */
const createSession = async (req, res, next) => {
  try {
    // TODO: add assertions
    const newSession = await sessionService.create(req.body);
    res.status(201).json(newSession);
  } catch (err) {
    logger.error(err);
    return res
      .status(500)
      .json({ message: "Error in creating a class session" });
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
    return res
      .status(500)
      .json({ message: "Error in retrieving all class sessions" });
  }
};

module.exports = { createSession, getAllSessions };
