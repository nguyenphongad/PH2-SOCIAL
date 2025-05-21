const { askGemini } = require("../service/geminiService");

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

const chatboxComment = async (req, res) => {
    const { message } = req.body;
    try {
        const response = await askGemini(message);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Endpoint mới để lấy đề xuất bình luận từ AI
const getCommentSuggestions = async (req, res) => {
    try {
        const { message } = req.body;
        
        // Nếu nội dung trống, yêu cầu AI tạo gợi ý bình luận ngẫu nhiên
        if (!message || message.trim() === "") {
            // Tạo prompt để AI tạo bình luận ngẫu nhiên vui nhộn
            const randomPrompt = `
            Hãy tạo 5 gợi ý bình luận ngẫu nhiên, vui nhộn cho mạng xã hội.
            Các bình luận nên:
            - Hài hước và tích cực
            - Ngắn gọn (tối đa 50 ký tự)
            - Sử dụng emoji khi phù hợp
            - Phù hợp với văn hóa Việt Nam
            - Có thể dùng cho bất kỳ bài đăng nào
            
            Trả lời dưới dạng mảng JSON, không có giải thích thêm.
            `;
            
            // Gọi AI để tạo gợi ý ngẫu nhiên
            const aiResponse = await askGemini(randomPrompt);
            
            try {
                // Xử lý phản hồi để đảm bảo định dạng đúng
                const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
                let suggestions = [];
                
                if (jsonMatch) {
                    suggestions = JSON.parse(jsonMatch[0]);
                } else {
                    // Xử lý khi không tìm thấy mẫu JSON
                    suggestions = aiResponse
                        .split('\n')
                        .filter(line => line.trim().length > 0)
                        .map(line => line.replace(/^[\d\.\-\*]+\s*/, '').replace(/"/g, '').trim())
                        .filter(line => line.length > 0 && line.length <= 60)
                        .slice(0, 5);
                }
                
                return res.status(200).json({
                    status: true,
                    suggestions: suggestions
                });
            } catch (jsonError) {
                console.error("Lỗi xử lý JSON từ AI:", jsonError);
                // Gọi lại AI nếu xử lý JSON thất bại
                return res.status(500).json({
                    status: false,
                    message: "Không thể tạo gợi ý bình luận, vui lòng thử lại"
                });
            }
        }

        // Nếu có nội dung, tiếp tục xử lý bình thường
        const prompt = `
        Hãy đưa ra 3-5 gợi ý bình luận ngắn gọn cho bài viết sau đây.
        Bình luận nên ngắn gọn, liên quan tới nội dung, đa dạng về cảm xúc (tích cực, hài hước, tò mò, v.v.),
        và phù hợp với văn hóa Việt Nam.
        Chỉ trả lời dưới định dạng mảng JSON gọn gàng không có lời giải thích thêm.
        Mỗi bình luận không quá 60 ký tự.

        Bài viết: "${message}"
        `;

        // Gọi AI để lấy gợi ý
        const aiResponse = await askGemini(prompt);
        
        try {
            // Xử lý phản hồi để đảm bảo định dạng đúng
            let jsonResponse;
            
            // Lọc ra phần JSON từ phản hồi (trong trường hợp AI trả về text thay vì JSON trực tiếp)
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
            
            if (jsonMatch) {
                jsonResponse = JSON.parse(jsonMatch[0]);
            } else {
                // Nếu không tìm thấy JSON, cố gắng parse cả chuỗi
                jsonResponse = JSON.parse(aiResponse);
            }
            
            // Đảm bảo đầu ra là một mảng
            if (!Array.isArray(jsonResponse)) {
                throw new Error('Không thể chuyển đổi phản hồi từ AI thành mảng');
            }
            
            return res.status(200).json({
                status: true,
                suggestions: jsonResponse
            });
        } catch (jsonError) {
            console.error("Lỗi xử lý JSON từ AI:", jsonError);
            
            // Nếu không thể parse JSON, xử lý bằng cách tách dòng và làm sạch
            const fallbackSuggestions = aiResponse
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map(line => line.replace(/^[\d\.\-\*]+\s*/, '').trim())
                .filter(line => line.length > 0 && line.length <= 60)
                .slice(0, 6);
                
            return res.status(200).json({
                status: true,
                suggestions: fallbackSuggestions
            });
        }
    } catch (error) {
        console.error("Lỗi khi lấy gợi ý bình luận:", error);
        return res.status(500).json({
            status: false,
            message: "Lỗi khi tạo gợi ý bình luận",
            error: error.message
        });
    }
};

module.exports = { 
    sendMessage, 
    getMessages, 
    chatboxComment, 
    getCommentSuggestions 
};