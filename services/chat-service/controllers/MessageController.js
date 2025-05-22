const { askGemini } = require("../service/geminiService");
const MessageModel = require("../models/MessageModel");
const ConversationModel = require("../models/ConversationModel");
const UserModel = require("../models/UserModel");
const mongoose = require("mongoose");

// Hàm kiểm tra kết nối
function isConnectionActive(res) {
  return res && res.connection && !res.connection.destroyed && !res.headersSent;
}

// Endpoint health check không yêu cầu xác thực
const healthCheck = (req, res) => {
  res.status(200).json({
    service: 'chat-service',
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
};

// Lấy danh sách tin nhắn từ cuộc hội thoại
const getMessages = async (req, res) => {
  try {
    // Kiểm tra xem response đã được gửi hoặc kết nối đã đóng
    if (!isConnectionActive(res)) {
      console.log("Kết nối đã đóng, không gửi response");
      return;
    }

    const { conversationId } = req.params;
    const currentUserId = req.user.userID;

    console.log(`Lấy tin nhắn từ cuộc hội thoại ${conversationId} cho user ${currentUserId}`);

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "ID cuộc hội thoại không hợp lệ" });
    }

    // Kiểm tra xem cuộc hội thoại có tồn tại và người dùng có phải là thành viên
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Cuộc hội thoại không tồn tại" });
    }

    // Kiểm tra xem người dùng hiện tại có phải là thành viên của cuộc hội thoại
    if (!conversation.participants.includes(currentUserId)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập cuộc hội thoại này" });
    }

    // Lấy tin nhắn từ cuộc hội thoại
    const messages = await MessageModel.find({ conversationId })
      .sort({ createdAt: 1 }) // Sắp xếp theo thời gian tăng dần
      .lean();

    return res.status(200).json({
      conversationId,
      messages,
      total: messages.length
    });
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn:", error);
    
    // Kiểm tra xem response đã được gửi hoặc kết nối đã đóng
    if (!isConnectionActive(res)) {
      console.log("Kết nối đã đóng, không gửi response error");
      return;
    }
    
    return res.status(500).json({ message: "Lỗi server khi lấy tin nhắn", error: error.message });
  }
};

// Lấy danh sách partners và tin nhắn mới nhất
const getListMessage = async (req, res) => {
  try {
    if (!isConnectionActive(res)) {
      console.log("Kết nối đã đóng, không gửi response");
      return;
    }

    const currentUserId = req.user.userID;
    console.log("Đang lấy danh sách đoạn chat cho user:", currentUserId);

    // Tìm tất cả cuộc hội thoại mà người dùng hiện tại tham gia
    const conversations = await ConversationModel.find({
      participants: currentUserId
    }).lean();

    if (!conversations || conversations.length === 0) {
      console.log("Không tìm thấy cuộc hội thoại nào");
      return res.status(200).json({ 
        partners: [],
        message: "Không tìm thấy cuộc hội thoại nào" 
      });
    }

    // Lấy danh sách userIDs của đối tác từ các cuộc hội thoại
    const partnerIds = new Set();
    conversations.forEach(conv => {
      conv.participants.forEach(participant => {
        if (participant.toString() !== currentUserId) {
          partnerIds.add(participant.toString());
        }
      });
    });

    // Lấy thông tin của các đối tác
    const partners = await UserModel.find(
      { userID: { $in: Array.from(partnerIds) } },
      'userID username name profilePicture'
    ).lean();

    // Lấy tin nhắn mới nhất cho mỗi cuộc hội thoại
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await MessageModel.findOne({ 
          conversationId: conversation._id 
        })
        .sort({ createdAt: -1 })
        .lean();

        return {
          ...conversation,
          lastMessage: lastMessage || null
        };
      })
    );

    // Kết hợp dữ liệu để gửi về client
    const result = partners.map(partner => {
      // Tìm cuộc hội thoại với đối tác này
      const conversation = conversationsWithLastMessage.find(conv => 
        conv.participants.some(p => p.toString() === partner.userID)  
      );

      let formattedConversation = {};
      if (conversation) {
        formattedConversation = {
          messages: {
            conversationId: conversation._id,
            participants: conversation.participants,
            lastMessage: conversation.lastMessage ? {
              content: conversation.lastMessage.message,
              time: conversation.lastMessage.createdAt,
              isMeChat: conversation.lastMessage.senderId === currentUserId
            } : null
          }
        };
      }

      return {
        ...partner,
        formattedConversations: formattedConversation
      };
    });

    console.log("Thành công lấy danh sách đoạn chat");
    return res.status(200).json({
      partners: result,
      total: result.length
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tin nhắn:", error);
    
    if (!isConnectionActive(res)) {
      console.log("Kết nối đã đóng, không gửi response error");
      return;
    }
    
    return res.status(500).json({ 
      message: "Lỗi server khi lấy danh sách tin nhắn", 
      error: error.message 
    });
  }
};

// Gửi tin nhắn
const sendMessage = async (req, res) => {
  try {
    // Kiểm tra nếu request đã bị abort
    if (req.aborted) {
      console.log("Request đã bị abort");
      return;
    }

    // Kiểm tra request đã đóng chưa
    if (!isConnectionActive(res)) {
      console.log("Kết nối đã đóng, không gửi response");
      return;
    }

    const { receiverId, message } = req.body;
    const senderId = req.user.userID;

    if (!receiverId || !message) {
      return res.status(400).json({ message: "Thiếu thông tin người nhận hoặc nội dung tin nhắn" });
    }

    // Tìm hoặc tạo cuộc hội thoại giữa hai người dùng
    let conversation = await ConversationModel.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    // Nếu chưa có cuộc hội thoại, tạo mới
    if (!conversation) {
      conversation = new ConversationModel({
        participants: [senderId, receiverId]
      });
      await conversation.save();
    }

    // Tạo tin nhắn mới
    const newMessage = new MessageModel({
      conversationId: conversation._id,
      senderId: senderId,
      receiverId: receiverId,
      message: message
    });

    // Lưu tin nhắn
    await newMessage.save();

    return res.status(201).json({
      message: "Gửi tin nhắn thành công",
      ...newMessage.toObject()
    });
  } catch (error) {
    console.error("Lỗi gửi tin nhắn:", error);
    
    if (!isConnectionActive(res)) {
      console.log("Kết nối đã đóng, không gửi response error");
      return;
    }
    
    return res.status(500).json({ message: "Lỗi server gửi tin nhắn", error: error.message });
  }
};

// Lấy tin nhắn từ một hộp thư cụ thể
const getBoxMessage = async (req, res) => {
  try {
    if (!isConnectionActive(res)) {
      console.log("Kết nối đã đóng, không gửi response");
      return;
    }

    const { userId } = req.params; // userId của người dùng đối tác
    const currentUserId = req.user.userID; // userId của người dùng hiện tại
    
    console.log(`Lấy tin nhắn giữa user ${currentUserId} và ${userId}`);

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    // Tìm cuộc hội thoại giữa hai người dùng
    let conversation = await ConversationModel.findOne({
      participants: { 
        $all: [currentUserId, userId] 
      }
    });

    // Nếu không có cuộc hội thoại, tạo mới
    if (!conversation) {
      conversation = new ConversationModel({
        participants: [currentUserId, userId],
      });
      await conversation.save();
      
      return res.status(200).json({
        conversationId: conversation._id,
        messages: []
      });
    }

    // Lấy tất cả tin nhắn của cuộc hội thoại
    const messages = await MessageModel.find({
      conversationId: conversation._id
    })
    .sort({ createdAt: 1 })
    .lean();

    return res.status(200).json({
      conversationId: conversation._id,
      messages
    });
  } catch (error) {
    console.error("Lỗi khi lấy hộp tin nhắn:", error);
    
    if (!isConnectionActive(res)) {
      console.log("Kết nối đã đóng, không gửi response error");
      return;
    }
    
    return res.status(500).json({ 
      message: "Lỗi server khi lấy hộp tin nhắn", 
      error: error.message 
    });
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

// Sửa endpoint getCommentSuggestions để xử lý đúng response từ AI
const getCommentSuggestions = async (req, res) => {
    try {
        console.log("Request body received:", req.body);
        
        // Chấp nhận cả hai trường content và message, ưu tiên content nếu có
        const content = req.body.content || req.body.message;
        
        if (!content || content.trim() === '') {
            return res.status(400).json({
                status: false,
                message: "Cần cung cấp nội dung bài viết để tạo gợi ý bình luận"
            });
        }

        // Giới hạn độ dài nội dung gửi đến AI để tránh lỗi
        const truncatedContent = content.length > 500 
            ? content.substring(0, 500) + "..." 
            : content;

        const prompt = `Bạn hãy đưa ra 5 gợi ý bình luận ngắn gọn có thể sử dụng cho bài đăng này, mỗi gợi ý cách nhau bằng dấu |. Nội dung bài đăng: "${truncatedContent}"`;
        
        console.log("Sending prompt to AI:", prompt);
        
        // Thêm timeout cụ thể và xử lý lỗi cho việc gọi AI API
        let aiResponse;
        try {
            // Timeout after 8 seconds
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("AI request timed out")), 8000);
            });
            
            const aiPromise = askGemini(prompt);
            aiResponse = await Promise.race([aiPromise, timeoutPromise]);
        } catch (aiError) {
            console.error("Error from AI service:", aiError);
            // Sử dụng gợi ý mặc định khi có lỗi từ AI
            aiResponse = "Rất hay!|Cảm ơn bạn đã chia sẻ!|Thật thú vị!|Tôi hoàn toàn đồng ý với bạn|Chia sẻ thêm nữa đi bạn";
        }
        
        // Kiểm tra kiểu dữ liệu của aiResponse và xử lý phù hợp
        console.log("AI Response type:", typeof aiResponse);
        console.log("AI Response:", aiResponse);
        
        let suggestions = [];
        
        if (typeof aiResponse === 'string') {
            // Nếu aiResponse là string, xử lý như trước đây
            suggestions = aiResponse.split('|')
                .map(item => item.trim())
                .filter(item => item.length > 0);
        } else if (typeof aiResponse === 'object' && aiResponse.text) {
            // Nếu aiResponse là object và có thuộc tính text
            suggestions = aiResponse.text.split('|')
                .map(item => item.trim())
                .filter(item => item.length > 0);
        } else if (Array.isArray(aiResponse)) {
            // Nếu aiResponse là mảng
            suggestions = aiResponse
                .map(item => typeof item === 'string' ? item.trim() : '')
                .filter(item => item.length > 0);
        }
        
        // Đảm bảo suggestions không rỗng
        if (suggestions.length === 0) {
            suggestions = [
                "Rất hay!",
                "Cảm ơn bạn đã chia sẻ!",
                "Thật thú vị!",
                "Tôi hoàn toàn đồng ý với bạn",
                "Chia sẻ thêm nữa đi bạn"
            ];
        }
        
        // Loại bỏ các khoảng trắng đầu/cuối và ký tự đặc biệt
        suggestions = suggestions.map(suggestion => {
            // Loại bỏ số thứ tự nếu có (ví dụ: "1.", "2.")
            return suggestion.replace(/^\d+[\.\)\-]?\s*/, '').trim();
        });
        
        // Giới hạn số lượng gợi ý (tối đa 5)
        if (suggestions.length > 5) {
            suggestions = suggestions.slice(0, 5);
        }
        
        console.log("Final suggestions:", suggestions);
        
        return res.status(200).json({
            status: true,
            suggestions
        });
    } catch (error) {
        console.error("Error generating comment suggestions:", error);
        
        // Luôn trả về một số gợi ý mặc định khi có lỗi
        const defaultSuggestions = [
            "Rất hay!",
            "Cảm ơn bạn đã chia sẻ!",
            "Thật thú vị!",
            "Tôi hoàn toàn đồng ý với bạn",
            "Chia sẻ thêm nữa đi bạn"
        ];
        
        return res.status(200).json({
            status: true,
            suggestions: defaultSuggestions,
            note: "Sử dụng gợi ý mặc định do gặp lỗi"
        });
    }
};

module.exports = { 
  sendMessage, 
  getMessages, 
  getListMessage,
  getBoxMessage,
  chatboxComment,
  getCommentSuggestions,
  healthCheck // Thêm health check vào exports
};