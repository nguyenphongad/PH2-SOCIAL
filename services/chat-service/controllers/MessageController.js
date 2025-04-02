const MessageModel = require("../models/MessageModel");
const ConversationModel = require("../models/ConversationModel")

const mongoose = require("mongoose")

const sendMessage = async (req, res) => {
    try {
        const { message, image, receiverId } = req.body;

        const senderId = req.user.userID;


        if ((!message || message.trim() === "") && (!image || image.trim() === "")) {
            return res.status(400).json({
                type: "send message",
                status: false,
                message: "Yêu cầu phải có nội dung tin nhắn hoặc hình ảnh"
            });
        }


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
        console.error("Lỗi khi gửi tin nhắn: ", error);
        res.status(500).json({ error: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?.userID || req.body?.userID;

        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ error: "ID đoạn chat không hợp lệ", messages: [] });
        }

        // 2. Kiểm tra người dùng có trong đoạn chat này không (nếu cần)
        const conversation = await ConversationModel.findOne({
            _id: conversationId,
            participants: userId
        });

        if (!conversation) {
            return res.status(403).json({ error: "Bạn không có quyền truy cập đoạn chat này", messages: [] });
        }

        // 3. Lấy tin nhắn
        const messages = await MessageModel.find({
            conversationId: conversationId
        }).sort({ createdAt: 1 }); // Sắp xếp theo thời gian



        res.status(200).json({
            type: "get all message",
            message: "Lấy tất cả đoạn chat thành công",
            conversationId: conversationId,
            messages
        });
    } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
        res.status(500).json({ error: "Lỗi server khi lấy tin nhắn" });
    }
};

module.exports = { sendMessage, getMessages }