const router = require("express").Router();
const controller = require("../controllers/observation");

router.get("/:simulationId", controller.getObservation);
router.patch("/note/:observationId", controller.recordNote);
router.patch("/simulation/:observationId", controller.recordSimTime);
router.patch("/device/:observationId", controller.syncDeviceTime);

module.exports = router;
