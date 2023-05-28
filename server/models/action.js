const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    project: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "project",
      required: true,
    },
    keyEvent: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "keyEvent",
      required: true,
    },
  },
  { timestamps: true }
);
const Action = mongoose.model("action", actionSchema);

module.exports = Action;
