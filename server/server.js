const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const logger = require("./config/log");

const { errorHandler } = require("./middleware/error");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;

// connect to db
require("./config/db")(app);

const corsOptions = {
  origin: "*",
  credentials: false,
};

// Use the custom error handling middleware
app.use(errorHandler);
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

// Initialise socket
const server = app.listen(port, () =>
  logger.info(`Server running on port: ${port}`)
);

require("./services/socket")(server);
