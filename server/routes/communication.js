const router = require("express").Router();
const controller = require("../controllers/communication");

router.get("/sna/:simulationId", controller.getSNAdata);
router.get("/ena/:simulationId", controller.getENAdata);

module.exports = router;
