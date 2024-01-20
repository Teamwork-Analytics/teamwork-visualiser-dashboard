const Simulation = require("../models/simulation");
const privateNoteService = require("./privateNote");

const single = async (id) => {
  return await Simulation.findById(id)
    .select("_id simulationId name description project observation")
    .populate("project ", "name");
};

const singleBySimulationId = async (simulationId) => {
  let simulation = await Simulation.findOne({ simulationId: simulationId })
    .select("_id simulationId name description project observation privateNote")
    .populate("project", "name")
    .populate("privateNote");

  // create another private note when not found
  if (!simulation.privateNote) {
    const privateNote = await privateNoteService.create();
    simulation.privateNote = privateNote;
    await simulation.save();
  }

  return simulation;
};

const create = async (data) => await Simulation.create(data);

const index = async () => await Simulation.find().populate("project", "name");

module.exports = { single, index, create, singleBySimulationId };
