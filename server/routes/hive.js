const router = require("express").Router();
const controller = require("../controllers/hive");

router.get("/:simulationId", controller.getCsvFile);
router.get("/phases/:simulationId", controller.getPhaseMarkers);

module.exports = router;
