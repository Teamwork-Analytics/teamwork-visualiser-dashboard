const mongoose = require("mongoose");

const empaticaSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  colour: { type: String, required: true },
  project: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "project",
    required: true,
  },
});

const Empatica = mongoose.model("empatica", empaticaSchema);

module.exports = Empatica;
