var router = require("express").Router();

// router.use("/users", require("./user"));
router.use("/sessions", require("./session"));

module.exports = router;
