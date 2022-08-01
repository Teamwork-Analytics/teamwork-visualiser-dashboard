const router = require("express").Router();
const controller = require("../controllers/simulation");

router.get("/", controller.getAllSims);
router.get("/:id", controller.getSimulation);
router.post("/", controller.createSimulation);

module.exports = router;
