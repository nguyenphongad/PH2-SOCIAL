const MessageModel = require("../models/MessageModel");
const  ConversationModel = require("../models/ConversationModel")

const mongoose = require("mongoose")

const sendMessage = async (req, res) => {
    try {
        const { message, image, receiverId } = req.body;

        const senderId = req.body.userID; 

        // Kiểm tra nếu cuộc trò chuyện đã tồn tại giữa senderId và receiverId
        let conversation = await ConversationModel.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        // Nếu chưa có cuộc trò chuyện, tạo mới
        if (!conversation) {
            conversation = new ConversationModel({
                participants: [senderId, receiverId],
                messages: []  
            });
            await conversation.save();  
        }

        // Tạo tin nhắn mới
        const newMessage = new MessageModel({
            conversationId: conversation._id,  
            senderId: new mongoose.Types.ObjectId(senderId),
            receiverId: new mongoose.Types.ObjectId(receiverId),
            message,
            image,
        });

        await newMessage.save();

        conversation.messages.push(newMessage._id);
        await conversation.save();

        res.status(201).json({
            message: "Gửi tin nhắn thành công",
            newMessage
        });
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        res.status(500).json({ error: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await MessageModel.find({ conversationId: req.params.conversationId });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { sendMessage, getMessages }