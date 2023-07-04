const xlsx = require("xlsx");
const path = require("node:path");

const getSNAJSONdata = async (simulationId) => {
  const fileName = simulationId + "_timetaged spatially separated data.xlsx";
  const directory = process.env.VISUALISATION_DIR + simulationId;
  const pathJoined = path.join(directory, path.sep, fileName);

  const workbook = xlsx.readFile(pathJoined);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = xlsx.utils.sheet_to_json(worksheet);
  // // Remove empty cells
  // return jsonData.map((row) => row.map((cell) => cell || ""));
  return jsonData;
};

module.exports = { getSNAJSONdata };
