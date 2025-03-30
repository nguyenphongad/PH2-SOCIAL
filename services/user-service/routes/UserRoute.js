const express = require("express");
const router = express.Router();

const { getProfileByUsername, searchUser, getUsersInfoFollower } = require("../controllers/UserController");
const authMiddleware = require("../middleware/UserMiddleware");

router.get("/search", authMiddleware, searchUser);
router.get("/:username", authMiddleware, getProfileByUsername);

router.post("/getUsersInfoFollower", authMiddleware,  getUsersInfoFollower);



module.exports = router;
