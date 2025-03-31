const express = require('express');
const postMiddleware = require('../middleware/PostMiddleware');
const { createPost, getPostByUsernameAndPostId, deletePost } = require('../controllers/PostController');
const { route } = require('../../auth-service/routes/AuthRoute');
const router = express.Router();


router.post("/create", postMiddleware, createPost);
router.get("/:username/:postId", getPostByUsernameAndPostId);
router.delete("/:postId", postMiddleware, deletePost);


module.exports = router