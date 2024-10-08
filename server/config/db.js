/**
 * This module exports a function that can be used for connecting to the database.
 */
const mongoose = require("mongoose");
const logger = require("winston");
require("dotenv").config(); // Configure $ATLAS_URI and other environment variables in .env file

const CONNECTION_URI = process.env.ATLAS_URI;

const connectDb = async () => {
  try {
    await mongoose.connect(CONNECTION_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true, // Add this line for Mongoose >= 6.0.0 compatability
    });
    logger.info("Successfully connected to Atlas.");
    return mongoose.connection; // Return the connection object instead of mongoose
  } catch (err) {
    logger.error("Failed. Connection to Atlas was unsuccessful");
    logger.error(err);
    process.exit(1);
  }
};

module.exports = connectDb;
