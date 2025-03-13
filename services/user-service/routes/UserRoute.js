const express = require("express");
const router = express.Router();

const { getProfileByUsername,checkToken } = require("../controllers/UserController");
const authMiddleware = require("../middleware/UserMiddleware");

// router.get("/checkToken", authMiddleware, checkToken);
router.get("/:username", authMiddleware, getProfileByUsername);

module.exports = router;
