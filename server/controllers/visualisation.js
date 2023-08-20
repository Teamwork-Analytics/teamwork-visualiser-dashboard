const AWS = require("aws-sdk");
const { fillErrorObject } = require("../middleware/error");
const logger = require("winston");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-southeast-4", // for example, 'us-west-1'
});

const s3 = new AWS.S3();

const checkDataReadiness = async (req, res, next) => {
  try {
    const { simulationId } = req.params;
    const directory = `${simulationId}/result/`;

    const hiveFileName = `${simulationId}_all.csv`;
    const positionFileName = `${simulationId}_network_data.csv`;
    const communicationFileName = `${simulationId}.csv`;
    const syncFileName = "sync.txt";
    const fileNames = [
      hiveFileName,
      positionFileName,
      communicationFileName,
      syncFileName,
    ];

    let missingFiles = [];

    for (const fileName of fileNames) {
      const params = {
        Bucket: process.env.VISUALISATION_DIR,
        Key: directory + fileName,
      };

      try {
        await s3.headObject(params).promise();
      } catch (error) {
        if (error.code === "NotFound") {
          missingFiles.push(fileName);
        } else {
          throw error;
        }
      }
    }

    if (missingFiles.length === fileNames.length) {
      res
        .status(500)
        .send(fillErrorObject(500, "All data is missing/not ready"));
      return;
    }

    if (missingFiles.length > 0) {
      res
        .status(500)
        .send(
          fillErrorObject(
            500,
            `${missingFiles.join(", ")} are missing/not ready`
          )
        );
      return;
    }

    res.status(200).send("At least one data is ready!");
  } catch (err) {
    logger.error(err);
    return res
      .status(500)
      .send(
        fillErrorObject(500, "Visualisation data is not ready (missing)", err)
      );
  }
};

module.exports = { checkDataReadiness };
