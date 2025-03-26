const express = require("express");
const { followUser, checkFollowStatus } = require("../controllers/SocicalController");
const socialMiddleware = require("../middleware/SocialMiddleware");

const router = express.Router();

router.post("/follow/:id", socialMiddleware, followUser);
router.get("/checkFollowStatus/:id", socialMiddleware, checkFollowStatus);

module.exports = router;