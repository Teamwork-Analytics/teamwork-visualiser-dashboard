const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const logger = require("./config/log");

require("dotenv").config({ path: "../.env" });

const { errorHandler } = require("./middleware/error");
const port = process.env.PORT || 5000;
const { USE_ABSOLUTE_PATH } = process.env;

// connect to db
require("./config/db")(app);

const corsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? [`http://${process.env.IP}:3000`, "http://localhost:3000"]
      : process.env.CURRENT_URL,
  credentials: false,
};

// Use the custom error handling middleware
app.use(errorHandler);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use("/api", require("./routes/index"));



let VISUALISATION_DIR;
if (USE_ABSOLUTE_PATH === "false") {
  VISUALISATION_DIR = path.join(__dirname, "/saved_data/");
} else {
  VISUALISATION_DIR = process.env.VISUALISATION_DIR;
}

console.log("VISUALISATION_DIR: ", VISUALISATION_DIR);

app.use("/data", express.static(VISUALISATION_DIR)); // Serve static files from the "saved_data" directory

app.use(express.static(path.join(__dirname, "client", "build")));
app.get("*", (req, res) => {
  // if (process.env.NODE_ENV !== "development") {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  // }
});

// Initialise socket
const server = app.listen(port, () =>
  logger.info(`Server running on port: ${port}`)
);

require("./services/socket")(server);
