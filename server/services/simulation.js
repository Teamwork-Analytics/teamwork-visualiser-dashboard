const Simulation = require("../models/simulation");

const single = async (id) => {
  return await Simulation.findById(id)
    .select("_id simulationId name description project observation")
    .populate("project ", "name");
};

const singleBySimulationId = async (simulationId) => {
  return await Simulation.findOne({ simulationId: simulationId }).select(
    "_id simulationId name description project observation"
  );
};

const create = async (data) => await Simulation.create(data);

const index = async () => await Simulation.find().populate("project", "name");

module.exports = { single, index, create, singleBySimulationId };
