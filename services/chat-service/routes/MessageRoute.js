const express = require('express');

const { sendMessage, getMessages } = require('../controllers/MessageController.js');
const chatMiddleware = require('../middleware/ChatMiddleware.js');
const { getChatPartners } = require('../controllers/ChatController.js');

const router = express.Router();

router.post('/', chatMiddleware, sendMessage);
router.post('/list-message', chatMiddleware, getChatPartners);
router.get('/:userID', chatMiddleware, getMessages);

module.exports = router;