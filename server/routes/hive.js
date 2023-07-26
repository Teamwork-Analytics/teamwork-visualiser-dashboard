const router = require("express").Router();
const controller = require("../controllers/hive");

router.get("/:simulationId", controller.getCsvFile);
router.get("/phases/:simulationId", controller.getPhaseMarkers);
router.get("/isReady/:simulationId", controller.isDataExist);

module.exports = router;
