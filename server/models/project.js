const mongoose = require("mongoose");
const NUM_OF_EMPATICAS = 6;

function arrayLimit(val) {
  return val.length <= NUM_OF_EMPATICAS;
}

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    empaticas: {
      type: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "empatica",
        },
      ],
      validate: [arrayLimit, `{PATH} exceeds the limit of ${NUM_OF_EMPATICAS}`],
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("project", projectSchema);

module.exports = Project;
