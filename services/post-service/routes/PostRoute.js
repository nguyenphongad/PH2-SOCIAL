const express = require('express');
const postMiddleware = require('../middleware/PostMiddleware');
const { createPost, getPostByUsernameAndPostId } = require('../controllers/PostController');
const { route } = require('../../auth-service/routes/AuthRoute');
const router = express.Router();


router.post("/create", postMiddleware, createPost);
router.get("/:username/:postId", getPostByUsernameAndPostId);


module.exports = router