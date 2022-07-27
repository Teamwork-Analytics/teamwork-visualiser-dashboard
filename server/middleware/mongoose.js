/**
 * This module contains mongoose validation middleware.
 */
const mongoose = require("mongoose");

const { fillErrorObject } = require("./error");

async function validateObjectId(_id, type, res, next) {
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    next(
      fillErrorObject(400, "Validation error", [
        `Given ${type} id is not in a valid hexadecimal format`,
      ])
    );
  } else {
    next();
  }
}

module.exports = {
  validateTeamObjectId,
};
