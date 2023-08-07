const express = require("express");
const router = express.Router();

const db = require("../services/db");
const validation = require("../services/validation");
const auth = require("../services/auth");

router.get("/:id", validation.validateUserId, db.getUserById);

router.post("/", validation.validateUser, db.createUser);

router.put("/:id", auth.authenticateUser, validation.validateUserUpdate, db.updateUser);

module.exports = router;