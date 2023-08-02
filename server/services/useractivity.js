const UserActivity = require("../models/useractivity");

const createActivity = async (data) => {
  return await UserActivity.create(data);
};

module.exports = { createActivity };
