const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const logger = require("./config/log");
const AWS = require("aws-sdk");

const { errorHandler } = require("./middleware/error");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;

// connect to db
require("./config/db")(app);

// AWS Configuration
AWS.config.update({
  region: "ap-southeast-4",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

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

app.get("/data/:simulationId/result/:filename", (req, res) => {
  const { simulationId, filename } = req.params;

  // Construct the S3 key based on how you store your files
  const s3Key = `${simulationId}/result/${filename}`;

  const s3Stream = s3
    .getObject({
      Bucket: process.env.VISUALISATION_DIR,
      Key: s3Key,
    })
    .createReadStream();

  s3Stream.on("error", (err) => {
    res.status(500).json({ error: "Error fetching video from S3" });
  });

  s3Stream.pipe(res);
});

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
