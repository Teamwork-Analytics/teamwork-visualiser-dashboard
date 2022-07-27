const Observation = require("../models/observation");
const projectService = require("./project");

const createWithEmpaticas = async (projectId) => {
  const projectEmpaticas = await projectService.getEmpaticas(projectId);
  const empaticas = projectEmpaticas["empaticas"].map((e) => {
    return { empatica: e };
  });
  return await Observation.create({
    synchronisations: empaticas,
  });
};

const update = async (id, info) => await Observation.findByIdAndUpdate(info);

module.exports = { createWithEmpaticas, update };
