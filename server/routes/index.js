var router = require("express").Router();
// const mongooseMiddleware = require('../middleware/mongoose');

// router.use("/users", require("./user"));
router.use("/sessions", require("./session"));
router.use("/projects", require("./project"));

module.exports = router;
