const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
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
    // refactor hiveViz below to be array of viz.
  },
  { timestamps: true }
);

const Session = mongoose.model("session", sessionSchema);

module.exports = Session;
