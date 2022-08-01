const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  deviceType: { type: String }, // e.g., empatica / video / fitbit / etc.
  name: String, // name of the device e.g., red, green, blue, etc.
  project: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "project",
    required: true,
  },
});

const Device = mongoose.model("device", deviceSchema);

module.exports = Device;
