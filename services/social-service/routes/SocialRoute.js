const express = require("express");
const { followUser } = require("../controllers/SocicalController");
const socialMiddleware = require("../middleware/SocialMiddleware");

const router = express.Router();

router.get("/follow/:id", socialMiddleware, followUser);
// router.get("/unfollow/:id", socialMiddleware, );

module.exports = router;