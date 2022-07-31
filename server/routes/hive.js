const router = require("express").Router();
const controller = require("../controllers/hive");

router.get("/:simulationId", controller.getCsvFile);
router.get("/:observationId", controller.getPhases);

module.exports = router;
