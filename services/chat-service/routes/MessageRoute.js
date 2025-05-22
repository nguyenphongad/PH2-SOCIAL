const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getMessages, 
  getListMessage, 
  getBoxMessage, 
  chatboxComment, 
  getCommentSuggestions,
  healthCheck 
} = require('../controllers/MessageController');
const chatMiddleware = require('../middleware/ChatMiddleware');

// Health check endpoint - Không yêu cầu xác thực
router.get('/health', healthCheck);

// Tất cả các routes khác sẽ yêu cầu xác thực
router.use(chatMiddleware);

// Route để gửi tin nhắn
router.post('/send-message', sendMessage);

// Route để lấy danh sách tin nhắn từ một cuộc hội thoại cụ thể
router.get('/list-message/:conversationId', getMessages);

// Route để lấy danh sách cuộc hội thoại của người dùng hiện tại
router.get('/list-message', getListMessage);

// Route để lấy hoặc tạo cuộc hội thoại với một người dùng khác
router.get('/box-message/:userId', getBoxMessage);

// Route để lấy gợi ý bình luận từ AI
router.post('/suggestion/comments', getCommentSuggestions);

// Route để lấy gợi ý lời nhắn từ AI
router.post('/chatbox-comment', chatboxComment);

module.exports = router;