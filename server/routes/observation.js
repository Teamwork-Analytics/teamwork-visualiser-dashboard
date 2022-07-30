const router = require("express").Router();
const controller = require("../controllers/observation");

router.get("/:simulationId", controller.getObservation);

module.exports = router;
