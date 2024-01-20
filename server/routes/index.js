var router = require("express").Router();
// const mongooseMiddleware = require('../middleware/mongoose');

// router.use("/users", require("./user"));
router.use("/simulations", require("./simulation"));
router.use("/observations", require("./observation"));
router.use("/projects", require("./project"));
router.use("/hives", require("./hive"));
router.use("/visualisations", require("./visualisation"));
router.use("/privateNotes", require("./privateNote"));

module.exports = router;
