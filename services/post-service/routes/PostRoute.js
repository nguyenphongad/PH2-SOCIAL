const express = require('express');
const { body, validationResult } = require('express-validator');
const postMiddleware = require('../middleware/PostMiddleware');
const { createPost, getPostByUsernameAndPostId, deletePost, updatePost, getPostsByUser, getFeedPosts, searchPosts, toggleLikePost, addComment, getComments } = require('../controllers/PostController');
const router = express.Router();


router.post(
    "/create",
    postMiddleware,
    [
        body('content').optional().isString().trim().isLength({ max: 1000 }),
        body('imageUrls').optional().isArray().custom((value, { req }) => {
            if (value && value.length > 10) {
                throw new Error('Chỉ được phép tải lên tối đa 10 hình ảnh.');
            }
            return true;
        }),
        body('imageUrls.*').if(body('imageUrls').exists({ checkFalsy: false }).isArray({ min: 1 })).isURL().withMessage('Mỗi URL hình ảnh phải là một URL hợp lệ.'),
        body('videoUrl').optional({ checkFalsy: true }).isURL(),

        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array(), status: false });
            }
            if (req.body.imageUrls === undefined && req.body.videoUrl === undefined) {
                return res.status(400).json({ message: 'Bạn phải cung cấp ít nhất một trong các trường: imageUrls, videoUrl' });
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
        body('imageUrls').optional().isArray(), // Sửa imageUrl thành imageUrls để phù hợp với request
        body('imageUrls.*').optional().isURL(), // Validation cho từng phần tử trong mảng imageUrls
        body('videoUrl').optional().isURL(),
        (req, res, next) => { // Custom validator
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            // Cập nhật điều kiện kiểm tra
            if (!req.body.content && (!req.body.imageUrls || req.body.imageUrls.length === 0) && !req.body.videoUrl) {
                return res.status(400).json({ 
                    message: 'Bài đăng phải có nội dung, hình ảnh hoặc video.'
                });
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
router.get("/:postId/comments", getComments);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'post-service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router