const logger = require("winston");
const Observation = require("../models/observation");
const projectService = require("./project");

const AUTO_POPULATE_KEY = "synchronisations.device synchronisations.syncTime";
const AUTO_POPULATE_VAL = "deviceId name deviceType";

const createWithDevices = async (projectId) => {
  const projectDevices = await projectService.getDevices(projectId);
  const devices = projectDevices["devices"].map((e) => {
    return { device: e };
  });
  return await Observation.create({
    synchronisations: devices,
  });
};

const single = async (id) => await Observation.findById(id);

const update = async (id, info) =>
  await Observation.findByIdAndUpdate(id, info, { new: true }).populate(
    AUTO_POPULATE_KEY,
    AUTO_POPULATE_VAL
  );

const addPhaseNote = async (obsId, newData) => {
  const { timeString, message } = newData;

  return await Observation.findByIdAndUpdate(
    obsId,
    {
      $push: { phases: { timestamp: new Date(timeString), message: message } },
    },
    { safe: true, upsert: true, new: true }
  ).populate(AUTO_POPULATE_KEY, AUTO_POPULATE_VAL);
};

const synchroniseDevice = async (obsId, syncData) => {
  const { deviceId, syncTime } = syncData;
  return await Observation.findOneAndUpdate(
    { _id: obsId, "synchronisations.device": deviceId },
    {
      $set: {
        "synchronisations.$.syncTime": syncTime,
      },
    },
    { upsert: false, new: true }
  ).populate(AUTO_POPULATE_KEY, AUTO_POPULATE_VAL);
};

module.exports = {
  createWithDevices,
  single,
  update,
  addPhaseNote,
  synchroniseDevice,
};
