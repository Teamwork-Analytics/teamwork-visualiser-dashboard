/**
 * This module exports a "Behaviour" mongoose Schema, which represents a data from user tracking.
 */
const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema(
  {
    simulationId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "simulation",
    },
    simNumId: {
      type: String,
      required: true,
    },
    page: { type: mongoose.Mixed }, // position where it records the data.
    action: { type: mongoose.Mixed }, // click, scroll, etc.
    element: { type: mongoose.Mixed },
    data: { type: mongoose.Mixed }, // additional information,
    clientTime: Date,
    serverTime: Date,
  },
  { timestamps: true }
);

const UserActivity = mongoose.model("useractivity", userActivitySchema);

module.exports = UserActivity;
