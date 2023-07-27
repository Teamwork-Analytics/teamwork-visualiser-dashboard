const mongoose = require("mongoose");
const { Schema } = mongoose;

const NurseSchema = new Schema({
  primaryNurse1: String,
  primaryNurse2: String,
  secondaryNurse1: String,
  secondaryNurse2: String,
});

const PrivateNoteSchema = new Schema({
  nurses: NurseSchema,
  createdAt: { type: Date, expires: "24h", default: Date.now }, // TTL index, delete after 24h
});

const PrivateNote = mongoose.model("privateNote", PrivateNoteSchema);

module.exports = PrivateNote;
