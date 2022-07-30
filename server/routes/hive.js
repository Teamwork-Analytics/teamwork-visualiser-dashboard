const router = require("express").Router();
const controller = require("../controllers/hive");

router.get("/:simulationId", controller.getCsvFile);

module.exports = router;
