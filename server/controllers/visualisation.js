const { fillErrorObject } = require("../middleware/error");
const fileSystem = require("fs");
const path = require("node:path");

const getVisualisationFile = (req, res, next) => {
  try {
    const { simulationId, visType } = req.params;
    let fileName = "";
    if (visType === "audio-socnet") {
      fileName = `audio_output_fig${simulationId}.png`;
    } else if (visType === "teamwork-barchart") {
      fileName = `teamwork.png`;
    }
    const directory = process.env.VISUALISATION_DIR + simulationId;
    const pathJoined = path.join(directory, path.sep, fileName);

    res.setHeader("content-type", "image/png");

    const readStream = fileSystem.createReadStream(pathJoined);

    readStream.pipe(res);
    readStream.on("error", (err) => {
      res
        .status(500)
        .send(
          fillErrorObject(500, "Unable to retrieve visualisation image", err)
        );
      readStream.emit("end"); //stop sending data
      return;
    });
  } catch (err) {
    return res
      .status(500)
      .send(
        fillErrorObject(500, "Unable to retrieve visualisation image", err)
      );
  }
};

module.exports = { getVisualisationFile };
