const router = require("express").Router();
const sessionController = require("../controllers/session");

router.get("/", sessionController.getAllSessions);
router.get("/:id", sessionController.getSession);
router.post("/", sessionController.createSession);

module.exports = router;
