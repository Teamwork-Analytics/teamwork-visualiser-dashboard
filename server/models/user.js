const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    audioRef: String,
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
