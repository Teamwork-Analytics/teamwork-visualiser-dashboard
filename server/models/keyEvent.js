const mongoose = require("mongoose");

/**
 * These are phases.
 */
const keyEventSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

const KeyEvent = mongoose.model("keyEvent", keyEventSchema);

module.exports = KeyEvent;
