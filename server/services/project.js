const Project = require("../models/project");
const Empatica = require("../models/empatica");
const SELECTION_FILTER = "_id name description empaticas";

const single = async (id) => {
  return await Project.findById(id).select(SELECTION_FILTER);
};

const create = async (data) => await Project.create(data);

const index = async () => await Project.find();

const singleByName = async (name) =>
  await Project.findOne({ name: name }).select(SELECTION_FILTER);

const registerEmpaticas = async (projectId, listOfEmpaticas) => {
  const project = await single(projectId);

  if (project.empaticas.length === 0) {
    const empaticas = Promise.all(
      listOfEmpaticas.map(async (d) => {
        return await Empatica.create({ ...d, project: projectId });
      })
    );
    project.empaticas = await empaticas;
  }

  return await project.save();
};

const getEmpaticas = async (id) =>
  await Project.findById(id).select("empaticas").populate("empaticas");

module.exports = {
  single,
  index,
  create,
  singleByName,
  registerEmpaticas,
  getEmpaticas,
};
