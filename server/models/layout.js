const mongoose = require("mongoose");

const layoutSchema = new mongoose.Schema(
  {
    name: String,
  },
  { timestamps: true }
);

const Layout = mongoose.model("layout", layoutSchema);

module.exports = Layout;
