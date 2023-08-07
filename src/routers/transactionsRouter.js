const express = require("express");
const router = express.Router();

const db = require("../services/db");
const validation = require("../services/validation");
const auth = require("../services/auth");

router.post("/", auth.authenticateAdmin, validation.validateTransaction, db.createTransaction);

module.exports = router;