const mongoose = require("mongoose");
const NUM_OF_DEVICES = 10;

function arrayLimit(val) {
  return val.length <= NUM_OF_DEVICES;
}

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    shortName: String,
    description: String,
    devices: {
      type: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "device",
        },
      ],
      validate: [arrayLimit, `{PATH} exceeds the limit of ${NUM_OF_DEVICES}`],
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("project", projectSchema);

module.exports = Project;
