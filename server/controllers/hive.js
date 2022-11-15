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
    const pathJoined = path.join(directory, path.sep, fileName);

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

module.exports = { getCsvFile, getPhaseMarkers };
