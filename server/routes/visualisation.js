const router = require("express").Router();
const controller = require("../controllers/visualisation");

router.get("/:simulationId/:visType", controller.getVisualisationFile);

module.exports = router;
