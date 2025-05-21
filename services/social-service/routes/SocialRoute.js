const express = require("express");
const { followUser, checkFollowStatus, getUsersInfoFollowing } = require("../controllers/SocicalController");
const socialMiddleware = require("../middleware/SocialMiddleware");

const router = express.Router();

router.post("/follow/:id", socialMiddleware, followUser);
router.get("/checkFollowStatus/:id", socialMiddleware, checkFollowStatus);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'social-service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;