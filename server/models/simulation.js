const mongoose = require("mongoose");

const simulationSchema = new mongoose.Schema(
  {
    simulationId: {
      type: String,
      required: true,
      unique: true,
    }, // as recorded
    name: {
      type: String,
      required: true,
    },
    description: String,
    project: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "project",
      required: true,
    },
    observation: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "observation",
    },
    privateNote: { type: mongoose.SchemaTypes.ObjectId, ref: "privateNote" },
    // refactor hiveViz below to be array of viz.
  },
  { timestamps: true }
);

const Session = mongoose.model("simulation", simulationSchema);

module.exports = Session;
