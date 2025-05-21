const express = require("express");
const router = express.Router();

const { getProfileByUsername, searchUser, getUsersInfoFollower, getUsersInfoFollowing } = require("../controllers/UserController");
const authMiddleware = require("../middleware/UserMiddleware");

router.get("/search", authMiddleware, searchUser);
router.get("/:username", authMiddleware, getProfileByUsername);

router.post("/getUsersInfoFollower", authMiddleware,  getUsersInfoFollower);

// Thêm route mới cho danh sách following
router.post("/getUsersInfoFollowing", authMiddleware, getUsersInfoFollowing);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
