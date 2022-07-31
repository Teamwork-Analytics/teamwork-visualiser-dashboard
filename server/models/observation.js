const mongoose = require("mongoose");
const Session = require("./simulation");

const deviceObs = {
  _id: false,
  device: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "device",
    autopopulate: true,
  },
  syncTime: { type: Date, default: null },
};

const phaseNote = {
  timestamp: Date,
  message: String,
};

const autoPopulateDevice = function (next) {
  this.populate(
    "synchronisations.device synchronisations.syncTime",
    "deviceId name deviceType"
  );
  next();
};

const obsSchema = new mongoose.Schema(
  {
    baselineTime: { type: Date, default: null },
    startTime: { type: Date, default: null },
    stopTime: { type: Date, default: null },
    phases: [phaseNote],
    synchronisations: [deviceObs],
    //TODO: add validation that empatica is from the correct project
  },
  { timestamps: true }
);

obsSchema
  .pre("findOne", autoPopulateDevice)
  .pre("find", autoPopulateDevice)
  .pre("updateOne", autoPopulateDevice);

//cascade delete
obsSchema.pre("remove", function (next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  Session.remove({ observation: this._id }).exec();
  next();
});

const Observation = mongoose.model("observation", obsSchema);

module.exports = Observation;
