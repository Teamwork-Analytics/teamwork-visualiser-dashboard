const mongoose = require("mongoose");
const Session = require("./session");

const empaticaObs = {
  _id: false,
  empatica: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "empatica",
  },
  syncTime: { type: Date, default: null },
};

const phaseNote = {
  timestamp: Date,
  message: String,
};

const autoPopulateEmpatica = function (next) {
  this.populate(
    "synchronisations.empatica synchronisations.syncTime",
    "deviceId colour"
  );
  next();
};

const obsSchema = new mongoose.Schema(
  {
    startBaseline: { type: Date, default: null },
    startTime: { type: Date, default: null },
    stopTime: { type: Date, default: null },
    phases: [phaseNote],
    synchronisations: [empaticaObs],
    //TODO: atm, only empatica that needs to be synchronised.
    //TODO: add validation that empatica is from the correct project
  },
  { timestamps: true }
);

obsSchema
  .pre("findOne", autoPopulateEmpatica)
  .pre("find", autoPopulateEmpatica);

//cascade delete
obsSchema.pre("remove", function (next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  Session.remove({ observation: this._id }).exec();
  next();
});

const Observation = mongoose.model("observation", obsSchema);

module.exports = Observation;
