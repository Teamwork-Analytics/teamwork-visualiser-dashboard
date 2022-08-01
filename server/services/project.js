const Project = require("../models/project");
const Device = require("../models/device");
const SELECTION_FILTER = "_id name description devices";

const single = async (id) => {
  return await Project.findById(id).select(SELECTION_FILTER);
};

const create = async (data) => await Project.create(data);

const index = async () => await Project.find();

const singleByName = async (name) =>
  await Project.findOne({ name: name }).select(SELECTION_FILTER);

const registerDevices = async (projectId, listOfDevices) => {
  const project = await single(projectId);

  if (project.devices.length === 0) {
    const devices = Promise.all(
      listOfDevices.map(async (d) => {
        return await Device.create({ ...d, project: projectId });
      })
    );
    project.devices = await devices;
  }

  return await project.save();
};

const getDevices = async (id) =>
  await Project.findById(id).select("devices").populate("devices");

module.exports = {
  single,
  index,
  create,
  singleByName,
  registerDevices,
  getDevices,
};
