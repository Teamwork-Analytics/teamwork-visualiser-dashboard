const { fillErrorObject } = require("../middleware/error");
const snaServices = require("../services/communication");

const getSNAdata = async (req, res) => {
  try {
    const { simulationId } = req.params;
    const data = await snaServices.getSNAJSONdata(simulationId);
    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(500)
      .send(
        fillErrorObject(500, "Unable to retrieve an excel file for SNA", err)
      );
  }
};

const getENAdata = async (req, res) => {
  try {
    const spawn = require("child_process").spawn;
    const python = spawn("python", ["../services/ena.py", sessionId]);

    python.stdout.on("data", function (data) {
      console.log("Pipe data from python script ...");
      dataToSend = data.toString();
    });
  } catch (err) {
    return res
      .status(500)
      .send(
        fillErrorObject(500, "Unable to retrieve an excel file for ENA", err)
      );
  }
};

module.exports = { getSNAdata, getENAdata };
