const MessageModel = require("../models/MessageModel");
const ConversationModel = require("../models/ConversationModel");

const mongoose = require("mongoose");

// Hàm kiểm tra kết nối
function isConnectionActive(res) {
  return res && res.connection && !res.connection.destroyed && !res.headersSent;
}

const sendMessage = async (req, res) => {
  try {
    // Kiểm tra nếu request đã bị abort
    if (req.aborted) {
      console.log('Request already aborted, skipping processing');
      return;
    }

    // Kiểm tra request đã đóng chưa
    if (!res.connection || res.connection.destroyed) {
      console.log('Client disconnected, aborting response');
      return;
    }

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

    // Kiểm tra kết nối trước khi gửi response
    if (isConnectionActive(res)) {
      res.status(201).json({
        message: "Gửi tin nhắn thành công",
        newMessage
      });
    } else {
      console.log('Connection closed, cannot send response');
    }
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn: ", error);

    // Kiểm tra kết nối trước khi gửi response lỗi
    if (isConnectionActive(res)) {
      res.status(500).json({ error: error.message });
    }
  }
};

const getMessages = async (req, res) => {
  try {
    // Kiểm tra nếu request đã bị abort
    if (req.aborted) {
      console.log('Request already aborted, skipping processing');
      return;
    }

    // Kiểm tra request đã đóng chưa
    if (!res.connection || res.connection.destroyed) {
      console.log('Client disconnected, aborting response');
      return;
    }

    const { userID } = req.params; // userId là ID của đối phương trong URL

    const currentUserId = req.user?.userID || req.body?.userID;

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

    // Kiểm tra kết nối trước khi gửi response
    if (isConnectionActive(res)) {
      return res.status(200).json({
        type: "get all message",
        message: "Lấy tất cả tin nhắn thành công",
        _id: conversation._id,
        messages
      });
    } else {
      console.log('Connection closed, cannot send response');
    }
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn:", error);

    // Kiểm tra kết nối trước khi gửi response lỗi
    if (isConnectionActive(res)) {
      res.status(500).json({ error: "Lỗi server khi lấy tin nhắn" });
    }
  }
};

module.exports = { sendMessage, getMessages };