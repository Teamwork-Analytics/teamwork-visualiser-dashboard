const router = require("express").Router();
const controller = require("../controllers/observation");

router.get("/:simulationId", controller.getObservation);
router.patch("/reset/:observationId", controller.resetObservation);

router.post("/note/:observationId", controller.recordNote);
router.patch("/note/:observationId", controller.updateNote);
router.delete("/note/:observationId/:noteId", controller.deletePhaseNote);
router.patch(
  "/note/:observationId/:noteId/favourite",
  controller.updateNoteFavourite
);
router.patch(
  "/note/:observationId/:noteId/performers",
  controller.updateNotePerformers
);

router.patch("/simulation/:observationId", controller.recordSimTime);
router.patch("/device/:observationId", controller.syncDeviceTime);

module.exports = router;
