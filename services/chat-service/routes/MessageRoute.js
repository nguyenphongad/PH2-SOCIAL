const express  = require('express');

const { sendMessage, getMessages } = require('../controllers/MessageController.js');
const chatMiddleware = require('../middleware/ChatMiddleware.js');

const router = express.Router();

router.post('/',chatMiddleware, sendMessage);
router.get('/:conversationId',chatMiddleware, getMessages);

module.exports =  router;