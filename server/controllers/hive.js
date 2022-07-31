const fileSystem = require("fs");
const { fillErrorObject } = require("../middleware/error");
const hiveServices = require("../services/hive");
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
    const path = "./data/hive/" + fileName;

    res.setHeader("cache-control", "max-age=8640000");
    res.setHeader("content-type", "text/csv");

    const readStream = fileSystem.createReadStream(path);

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

const getPhases = async (req, res, next) => {
  try {
    const { observationId } = req.params;
    const phases = await hiveServices.constructPhasesArrayFromObservation(
      observationId
    );
    if (phases.length === 0) {
      return res.status(400);
    }
  } catch (err) {
    return res
      .status(500)
      .send(fillErrorObject(500, "Unable to retrieve phases from HIVE", err));
  }
};

module.exports = { getCsvFile, getPhases };
