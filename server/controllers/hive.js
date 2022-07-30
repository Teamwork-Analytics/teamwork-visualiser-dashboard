const fileSystem = require("fs");
const { fillErrorObject } = require("../middleware/error");

const getCsvFile = (req, res, next) => {
  // try {
  //   const { sessionId } = req.params;
  //   const fileName = sessionId + "_all.csv";
  //   const path = "./data/hive/" + fileName;

  //   var readStream = fileSystem.createReadStream(path);

  //   res.writeHead(200, {
  //     "Content-Type": "text/csv",
  //     "Content-Disposition": "attachment; filename=" + fileName,
  //   });

  //   return res.send({data: })
  //   // readStream.pipe(res).on("error", function (e) {
  //   //   return res
  //   //     .status(500)
  //   //     .send(
  //   //       fillErrorObject(500, "Unable to retrieve a csv file for HIVE", e)
  //   //     );
  //   // });

  // } catch (err) {
  //   return res
  //     .status(500)
  //     .send(
  //       fillErrorObject(500, "Unable to retrieve a csv file for HIVE", err)
  //     );
  // }

  try {
    const { sessionId } = req.params;
    const fileName = sessionId + "_all.csv";
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

module.exports = { getCsvFile };
