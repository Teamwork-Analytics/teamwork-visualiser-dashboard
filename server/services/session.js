const Session = require("../models/session");

const single = async (id) => {
  return await Session.findById(id)
    .select("_id sessionId name description project observation")
    .populate(
      "project observation",
      "name startTime startBaseline stopTime phases "
    );
};

const create = async (data) => await Session.create(data);

const index = async () => await Session.find().populate("project", "name");

module.exports = { single, index, create };
