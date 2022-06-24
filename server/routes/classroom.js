const router = require("express").Router();
const classroomController = require("../controllers/classroom");
// const mongooseMiddleware = require('../middleware/mongoose');

router.get("/", classroomController.getAllClassrooms);
router.post("/", classroomController.createClassroom);

// This section will help you get a list of all the records.
module.exports = router;
