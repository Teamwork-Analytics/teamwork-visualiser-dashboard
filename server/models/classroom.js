const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema(
  {
    name: String,
    layout: { type: mongoose.SchemaTypes.ObjectId, ref: "layout" },
    speakers: [{ type: mongoose.SchemaTypes.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

const Classroom = mongoose.model("classroom", classroomSchema);

module.exports = Classroom;
