const express = require("express");
const router = express.Router();

const auth = require("../services/auth");
const stats = require("../services/stats");


router.get("/", auth.authenticateAdmin, stats.getStats);

module.exports = router;