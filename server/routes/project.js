const router = require("express").Router();
const projectController = require("../controllers/project");

router.get("/", projectController.getAllProjects);
router.post("/", projectController.createProject);
router.put("/", projectController.registerDevices);

module.exports = router;
