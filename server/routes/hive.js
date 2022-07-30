const router = require("express").Router();
const controller = require("../controllers/hive");

router.get("/:sessionId", controller.getCsvFile);

module.exports = router;
