const router = require("express").Router();
const controller = require("../controllers/visualisation");

// router.get("/:simulationId/:visType", controller.getVisualisationFile);
router.get("/isReady/:simulationId", controller.checkDataReadiness);

module.exports = router;
