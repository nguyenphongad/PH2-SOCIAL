const express = require("express");
const router = express.Router();

const { getProfileByUsername, searchUser } = require("../controllers/UserController");
const authMiddleware = require("../middleware/UserMiddleware");

router.get("/search", authMiddleware, searchUser);
router.get("/:username", authMiddleware, getProfileByUsername);

module.exports = router;
