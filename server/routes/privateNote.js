const router = require("express").Router();
const controller = require("../controllers/privateNote");

router.get("/:simulationId", controller.getPrivateNote);
router.patch("/:simulationId", controller.updatePrivateNote);

module.exports = router;
