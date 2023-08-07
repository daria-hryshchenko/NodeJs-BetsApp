const express = require("express");
const router = express.Router();

const db = require("../services/db");
const validation = require("../services/validation");
const auth = require("../services/auth");

router.post("/", auth.authenticateAdmin, validation.validateEvent, db.createEvent);
router.put("/:id", auth.authenticateAdmin, validation.validateEventResult, db.updateEventResult);

module.exports = router;