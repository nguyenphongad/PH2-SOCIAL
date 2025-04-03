const mongoose  = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    image: String,
    createdAt: { type: Date, default: Date.now },
    isEdited: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false }
});

const MessageModel =  mongoose.model('messages', MessageSchema);

module.exports = MessageModel