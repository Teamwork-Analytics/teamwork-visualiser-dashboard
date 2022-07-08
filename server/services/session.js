const Session = require("../models/session");

const single = async (id) => {
  return await Session.findById(id).select("_id name");
};

const create = async (data) => await Session.create(data);

const index = async () => await Session.find();

module.exports = { single, index, create };
