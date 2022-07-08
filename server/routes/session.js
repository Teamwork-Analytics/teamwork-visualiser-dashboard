const router = require("express").Router();
const sessionController = require("../controllers/session");
// const mongooseMiddleware = require('../middleware/mongoose');

router.get("/", sessionController.getAllSessions);
router.post("/", sessionController.createSession);

// This section will help you get a list of all the records.
module.exports = router;
