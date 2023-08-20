const router = require("express").Router();
const controller = require("../controllers/visualisation");

router.get("/isReady/:simulationId", controller.checkDataReadiness);

module.exports = router;
