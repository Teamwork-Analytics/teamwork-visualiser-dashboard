const logger = require("winston");
const classroomService = require("../services/classroom");

/**
 * Create a new classroom
 * @param {*} req essayId
 * @param {*} res send newly created classroom object
 */
const createClassroom = async (req, res, next) => {
  try {
    // TODO: add assertions
    const newClassroom = await classroomService.create(req.body);
    res.status(201).json(newClassroom);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ message: "Error in creating the classroom" });
  }
};

/**
 * Get all classrooms
 * @param {*} req
 * @param {*} res
 */
const getAllClassrooms = async (req, res, next) => {
  try {
    const allClassrooms = await classroomService.index();
    res.status(200).json(allClassrooms);
  } catch (err) {
    logger.error(err);
    return res
      .status(500)
      .json({ message: "Error in retrieving all classrooms" });
  }
};

module.exports = { createClassroom, getAllClassrooms };
