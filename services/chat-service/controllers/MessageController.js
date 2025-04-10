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
        const { userID } = req.params; // userId là ID của đối phương trong URL

        // console.log(userID)
        
        const currentUserId = req.user?.userID || req.body?.userID;

        // console.log(req.user?.userID)
        // console.log(req.body?.userID)

        // Kiểm tra tính hợp lệ của userID
        if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(400).json({ error: "ID đối phương không hợp lệ", messages: [] });
        }

        // Tìm cuộc trò chuyện giữa người dùng hiện tại và đối phương
        const conversation = await ConversationModel.findOne({
            participants: { $all: [currentUserId, userID] }  // Tìm cuộc trò chuyện giữa 2 người
        });

        if (!conversation) {
            return res.status(404).json({ error: "Không tìm thấy cuộc trò chuyện với đối phương này", messages: [] });
        }

        // Lấy tất cả tin nhắn trong cuộc trò chuyện
        const messages = await MessageModel.find({
            conversationId: conversation._id
        }).sort({ createdAt: 1 }); // Sắp xếp theo thời gian

        return res.status(200).json({
            type: "get all message",
            message: "Lấy tất cả tin nhắn thành công",
            _id: conversation._id,
            messages
        });
    } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
        res.status(500).json({ error: "Lỗi server khi lấy tin nhắn" });
    }
};

module.exports = { sendMessage, getMessages }