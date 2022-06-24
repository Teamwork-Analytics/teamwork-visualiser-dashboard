const Classroom = require("../models/classroom");

const single = async (id) => {
  return await Classroom.findById(id).select("_id name");
};

const create = async (data) => await Classroom.create(data);

const index = async () => await Classroom.find();

module.exports = { single, index, create };
