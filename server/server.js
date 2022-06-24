const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const logger = require("./config/log");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5002;

// connect to db
require("./config/db")(app);

const corsOptions = {
  credentials: false,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use("/api", require("./routes/index"));
app.use(express.static(path.join(__dirname, "client", "build")));
app.get("*", (req, res) => {
  // if (process.env.NODE_ENV !== "development") {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  // }
});
app.listen(port, () => logger.info(`Server running on port: ${port}`));
