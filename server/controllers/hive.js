const fileSystem = require("fs");
const { fillErrorObject } = require("../middleware/error");
const hiveServices = require("../services/hive");
const path = require("node:path");

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const getCsvFile = (req, res, next) => {
  try {
    const { simulationId } = req.params;
    const fileName = simulationId + "_all.csv";
    const directory = process.env.VISUALISATION_DIR + simulationId;
    const result_dir = path.join(directory, path.sep, "result");
    const pathJoined = path.join(result_dir, path.sep, fileName);

    // res.setHeader("cache-control", "max-age=8640000");
    res.setHeader("content-type", "text/csv");

    const readStream = fileSystem.createReadStream(pathJoined);

    readStream.pipe(res);
    readStream.on("error", (err) => {
      res
        .status(500)
        .send(
          fillErrorObject(500, "Unable to retrieve a csv file for HIVE", err)
        );
      readStream.emit("end"); //stop sending data
      return;
    });
  } catch (err) {
    return res
      .status(500)
      .send(
        fillErrorObject(500, "Unable to retrieve a csv file for HIVE", err)
      );
  }
};

const getPhaseMarkers = async (req, res, next) => {
  try {
    const { simulationId } = req.params;

    const phasesData = await hiveServices.constructPhasesArrayFromObservation(
      simulationId
    );

    return res.status(200).json(phasesData);
  } catch (err) {
    return res
      .status(500)
      .send(fillErrorObject(500, "Unable to retrieve phases for HIVE", err));
  }
};

const isDataExist = async (req, res, next) => {
  try {
    const { simulationId } = req.params;
    const directory = process.env.VISUALISATION_DIR + simulationId;
    const result_dir = path.join(directory, path.sep, "result");
    const hiveFileName = `${simulationId}_all.csv`;

    if (!fileSystem.existsSync(path.join(result_dir, path.sep, hiveFileName))) {
      res
        .status(500)
        .send(fillErrorObject(500, "Ward map data is missing/not ready"));
      return;
    }
    res.status(200).send("Ward map data is ready!");
    return;
  } catch (err) {
    logger.error(err);
    return res
      .status(500)
      .send(
        fillErrorObject(500, "Visualisation data is not ready (missing)", err)
      );
  }
};

module.exports = { getCsvFile, getPhaseMarkers, isDataExist };
