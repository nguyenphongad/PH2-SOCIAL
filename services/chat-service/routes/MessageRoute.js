const express = require('express');

const messageController = require('../controllers/MessageController');
const jwtMiddleware = require('../middleware/ChatMiddleware.js');
const { getChatPartners } = require('../controllers/ChatController.js');

const router = express.Router();

// Đăng ký các route hiện tại
router.post('/send', jwtMiddleware, messageController.sendMessage);
router.get('/:userID', jwtMiddleware, messageController.getMessages);
router.post('/chatbox-comment', messageController.chatboxComment);

// Thêm route mới cho gợi ý bình luận
router.post('/suggestion/comments', messageController.getCommentSuggestions);

router.post('/list-message', jwtMiddleware, getChatPartners);

module.exports = router;