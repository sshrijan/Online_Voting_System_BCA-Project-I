const express = require("express");
const { getSettings, updateSettings } = require("../controllers/settings.controller");
const authenticate = require("../middlewares/auth");
const isAdmin = require("../middlewares/adminAuth");

const router = express.Router();

router.get("/", getSettings);

// Admin route to set timer
router.put("/", authenticate, isAdmin, updateSettings);

module.exports = router;
