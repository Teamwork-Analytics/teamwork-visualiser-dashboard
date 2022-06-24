var router = require("express").Router();

// router.use("/users", require("./user"));
router.use("/classrooms", require("./classroom"));

module.exports = router;
