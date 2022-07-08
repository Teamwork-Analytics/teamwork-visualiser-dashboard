const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    name: String,
    layout: { type: mongoose.SchemaTypes.ObjectId, ref: "layout" },
    speakers: [{ type: mongoose.SchemaTypes.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

const Session = mongoose.model("session", sessionSchema);

module.exports = Session;
