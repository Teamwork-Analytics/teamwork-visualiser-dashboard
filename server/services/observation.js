const logger = require("winston");
const Observation = require("../models/observation");
const projectService = require("./project");
const mongoose = require("mongoose");
const { formatMessageToKey } = require("../utils/index");

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

const update = async (id, data) =>
  await Observation.findByIdAndUpdate(id, data, { new: true }).populate(
    AUTO_POPULATE_KEY,
    AUTO_POPULATE_VAL
  );

const resetSyncTime = async (id) => {
  await Observation.findByIdAndUpdate(
    id,
    {
      $set: {
        "synchronisations.$[].syncTime": null,
      },
    },
    { new: true, upsert: false }
  ).populate(AUTO_POPULATE_KEY, AUTO_POPULATE_VAL);
};

const addPhaseNote = async (obsId, newData) => {
  const { timeString, message } = newData;

  return await Observation.findByIdAndUpdate(
    obsId,
    {
      $push: {
        phases: {
          timestamp: new Date(timeString),
          message: message,
          phaseKey: formatMessageToKey(message),
        },
      },
    },
    {
      safe: true,
      upsert: true,
      new: true,
    }
  ).populate(AUTO_POPULATE_KEY, AUTO_POPULATE_VAL);
};

const updatePhaseNote = async (obsId, newData) => {
  const { noteId, message, timeString } = newData;
  const timestamp = new Date(timeString);

  return await Observation.findOneAndUpdate(
    { _id: obsId, "phases._id": noteId },
    {
      $set: {
        "phases.$.message": message,
        "phases.$.timestamp": timestamp,
        "phases.$.phaseKey": formatMessageToKey(message),
      },
    },
    {
      new: true,
    }
  ).populate(AUTO_POPULATE_KEY, AUTO_POPULATE_VAL);
};

const deleteNote = async (obsId, phaseNoteId) => {
  return await Observation.findByIdAndUpdate(
    obsId,
    {
      $pull: {
        phases: {
          _id: phaseNoteId,
        },
      },
    },
    { new: true }
  );
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
  updatePhaseNote,
  deleteNote,
  synchroniseDevice,
  resetSyncTime,
};
