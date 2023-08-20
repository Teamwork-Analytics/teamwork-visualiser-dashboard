const fileSystem = require("fs");
const { fillErrorObject } = require("../middleware/error");
const hiveServices = require("../services/hive");
const path = require("node:path");

const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-southeast-4", // for example, 'us-west-1'
});

const s3 = new AWS.S3();

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
    const fileName = `${simulationId}_all.csv`;
    const key = `${simulationId}/result/${fileName}`;

    const params = {
      Bucket: process.env.VISUALISATION_DIR,
      Key: key,
    };

    s3.getObject(params, (err, data) => {
      if (err) {
        res
          .status(500)
          .send(
            fillErrorObject(500, "Unable to retrieve a csv file for HIVE", err)
          );
      } else {
        res.setHeader("content-type", "text/csv");
        res.send(data.Body);
      }
    });
  } catch (err) {
    res
      .status(500)
      .send(
        fillErrorObject(500, "Unable to retrieve a csv file for HIVE", err)
      );
  }
};
// const getCsvFile = (req, res, next) => {
//   try {
//     const { simulationId } = req.params;
//     const fileName = simulationId + "_all.csv";
//     const directory = process.env.VISUALISATION_DIR + simulationId;
//     const result_dir = path.join(directory, path.sep, "result");
//     const pathJoined = path.join(result_dir, path.sep, fileName);

//     // res.setHeader("cache-control", "max-age=8640000");
//     res.setHeader("content-type", "text/csv");

//     const readStream = fileSystem.createReadStream(pathJoined);

//     readStream.pipe(res);
//     readStream.on("error", (err) => {
//       res
//         .status(500)
//         .send(
//           fillErrorObject(500, "Unable to retrieve a csv file for HIVE", err)
//         );
//       readStream.emit("end"); //stop sending data
//       return;
//     });
//   } catch (err) {
//     return res
//       .status(500)
//       .send(
//         fillErrorObject(500, "Unable to retrieve a csv file for HIVE", err)
//       );
//   }
// };

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

const isDataExist = (req, res, next) => {
  try {
    const { simulationId } = req.params;
    const fileName = `${simulationId}_all.csv`;
    const key = `${simulationId}/result/${fileName}`;

    const params = {
      Bucket: process.env.VISUALISATION_DIR,
      Key: key,
    };

    s3.headObject(params, (err, data) => {
      if (err) {
        res
          .status(500)
          .send(fillErrorObject(500, "Ward map data is missing/not ready"));
      } else {
        res.status(200).send("Ward map data is ready!");
      }
    });
  } catch (err) {
    res
      .status(500)
      .send(
        fillErrorObject(500, "Visualisation data is not ready (missing)", err)
      );
  }
};

module.exports = { getCsvFile, getPhaseMarkers, isDataExist };
