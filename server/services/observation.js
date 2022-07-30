const Observation = require("../models/observation");
const projectService = require("./project");

const createWithDevices = async (projectId) => {
  const projectDevices = await projectService.getDevices(projectId);
  const devices = projectDevices["devices"].map((e) => {
    return { device: e };
  });
  return await Observation.create({
    synchronisations: devices,
  });
};

const update = async (id, info) => await Observation.findByIdAndUpdate(info);

module.exports = { createWithDevices, update };
