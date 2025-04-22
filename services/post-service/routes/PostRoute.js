const express = require('express');
const { body, validationResult } = require('express-validator');
const postMiddleware = require('../middleware/PostMiddleware');
const { createPost, getPostByUsernameAndPostId, deletePost, updatePost, getPostsByUser, getFeedPosts, searchPosts, toggleLikePost, addComment } = require('../controllers/PostController');
const router = express.Router();


router.post(
    "/create",
    postMiddleware,
    [
        body('content').optional().isString().trim().isLength({ max: 1000 }),
        body('imageUrl').optional().isURL(),
        body('videoUrl').optional().isURL(),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            if (req.body.imageUrl === undefined && req.body.videoUrl === undefined) {
                return res.status(400).json({ message: 'Bạn phải cung cấp ít nhất một trong các trường: imageUrl, videoUrl' });
            }
            next();
        }
    ],
    createPost
);

router.get("/id/:postId", postMiddleware, getPostByUsernameAndPostId);
router.get("/user/:username", postMiddleware, getPostsByUser);
router.delete("/:postId", postMiddleware, deletePost);

router.put(
    "/:postId",
    postMiddleware,
    [
        // Validation rules
        body('content').optional().isString().trim().isLength({ max: 1000 }),
        body('imageUrl').optional().isURL(),
        body('videoUrl').optional().isURL(),
        (req, res, next) => { // Custom validator
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            if (req.body.imageUrl === undefined && req.body.videoUrl === undefined) {
                return res.status(400).json({ message: 'Bạn phải cung cấp ít nhất một trong các trường: imageUrl, videoUrl' });
            }
            next();
        }
    ],
    updatePost
);

router.get("/feed", postMiddleware, getFeedPosts);
router.get("/search", postMiddleware, searchPosts);
router.post("/:postId/likes", postMiddleware, toggleLikePost);
router.post("/:postId/comments", postMiddleware, addComment);

module.exports = router