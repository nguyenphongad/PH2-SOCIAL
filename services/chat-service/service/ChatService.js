const MessageModel = require('../models/MessageModel');
const ConversationModel = require('../models/ConversationModel');
const UserModel = require('../models/UserModel');
const mongoose = require('mongoose');

class ChatService {
  constructor(io) {
    this.io = io;
    this.onlineUsers = new Map(); // Map để lưu trữ socket.id theo userID
    
    // Kiểm tra kết nối MongoDB trước khi thiết lập Socket handlers
    this.checkMongoConnection().then(() => {
      this.setupSocketHandlers();
      console.log("ChatService initialized with Socket.IO");
    }).catch(err => {
      console.error("Failed to initialize ChatService:", err);
    });
  }
  
  // Phương thức mới để kiểm tra kết nối MongoDB
  async checkMongoConnection() {
    // Kiểm tra trạng thái kết nối MongoDB
    if (mongoose.connection.readyState !== 1) {
      console.log("Waiting for MongoDB connection...");
      return new Promise((resolve, reject) => {
        // Đặt timeout sau 30 giây
        const timeout = setTimeout(() => {
          reject(new Error("MongoDB connection timeout after 30s"));
        }, 30000);
        
        // Đăng ký sự kiện connected
        mongoose.connection.once('connected', () => {
          clearTimeout(timeout);
          console.log("MongoDB connected, initializing ChatService");
          resolve();
        });
        
        // Đăng ký sự kiện error
        mongoose.connection.once('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
    }
    
    return Promise.resolve();
  }

  // Thiết lập các event handlers cho socket
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Đăng ký người dùng khi kết nối
      socket.on('register', (userData) => {
        this.registerUser(socket, userData);
      });

      // Xử lý khi người dùng gửi tin nhắn
      socket.on('send_message', async (data) => {
        console.log("Nhận tin nhắn từ client:", data);
        await this.handleSendMessage(socket, data);
      });

      // Xử lý khi người dùng đang gõ
      socket.on('typing', (data) => {
        this.handleTyping(socket, data);
      });

      // Xử lý khi người dùng ngừng gõ
      socket.on('stop_typing', (data) => {
        this.handleStopTyping(socket, data);
      });

      // Xử lý khi người dùng ngắt kết nối
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
    
    setInterval(() => {
      console.log(`Số người dùng đang online: ${this.onlineUsers.size}`);
      this.broadcastOnlineUsers();
    }, 30000); // Log số người online mỗi 30 giây
  }

  // Đăng ký người dùng khi họ kết nối
  registerUser(socket, userData) {
    try {
      if (!userData || !userData.userID) {
        socket.emit('error', { message: 'User data is required' });
        return;
      }

      const { userID } = userData;
      
      // Lưu thông tin người dùng đang online
      this.onlineUsers.set(userID, socket.id);
      
      // Thêm người dùng vào "phòng" riêng của họ để dễ tìm
      socket.join(`user:${userID}`);
      
      console.log(`User registered: ${userID}, socket ID: ${socket.id}`);
      console.log(`Online users: ${this.onlineUsers.size}`);
      
      // Thông báo cho người dùng đăng ký thành công
      socket.emit('registered', { 
        success: true, 
        message: 'Kết nối thành công',
        onlineCount: this.onlineUsers.size 
      });
      
      // Gửi danh sách người dùng đang online
      this.broadcastOnlineUsers();
    } catch (error) {
      console.error('Error registering user:', error);
      socket.emit('error', { message: 'Failed to register user' });
    }
  }

  // Xử lý khi người dùng gửi tin nhắn
  async handleSendMessage(socket, data) {
    try {
      console.log("Xử lý tin nhắn:", data);
      const { senderId, receiverId, message, conversationId } = data;
      
      if (!senderId || !receiverId || !message) {
        socket.emit('error', { message: 'Missing required data for sending message' });
        return;
      }

      console.log(`Message from ${senderId} to ${receiverId}: ${message}`);

      // Tìm hoặc tạo cuộc hội thoại
      let conversation;
      if (conversationId) {
        conversation = await ConversationModel.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }
      } else {
        // Tìm cuộc hội thoại giữa hai người dùng
        conversation = await ConversationModel.findOne({
          participants: { $all: [senderId, receiverId] }
        });

        // Nếu không tìm thấy, tạo cuộc hội thoại mới
        if (!conversation) {
          conversation = new ConversationModel({
            participants: [senderId, receiverId]
          });
          await conversation.save();
        }
      }

      // Tạo tin nhắn mới
      const newMessage = new MessageModel({
        conversationId: conversation._id,
        senderId,
        receiverId,
        message,
        readStatus: false
      });

      // Lưu tin nhắn vào database
      await newMessage.save();

      // Chuẩn bị tin nhắn để gửi qua socket
      const messageToSend = {
        _id: newMessage._id,
        conversationId: newMessage.conversationId,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        message: newMessage.message,
        readStatus: newMessage.readStatus,
        createdAt: newMessage.createdAt
      };

      console.log("Đang gửi tin nhắn qua socket:", messageToSend);
      
      // Gửi tin nhắn đến người gửi
      socket.emit('receive_message', messageToSend);

      // Gửi tin nhắn đến người nhận nếu họ online
      const receiverSocketId = this.onlineUsers.get(receiverId);
      if (receiverSocketId) {
        console.log(`Người nhận ${receiverId} đang online với socket ${receiverSocketId}, đang gửi tin nhắn...`);
        this.io.to(receiverSocketId).emit('receive_message', messageToSend);
      } else {
        console.log(`Người nhận ${receiverId} không online, tin nhắn sẽ được thông báo khi họ kết nối lại`);
      }

      // Gửi thông báo thành công cho người gửi
      socket.emit('message_sent', { 
        success: true, 
        message: 'Tin nhắn đã được gửi',
        data: messageToSend
      });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message', error: error.message });
    }
  }

  // Xử lý sự kiện người dùng đang gõ
  handleTyping(socket, data) {
    try {
      const { senderId, receiverId } = data;
      
      if (!senderId || !receiverId) {
        return;
      }

      console.log(`${senderId} đang gõ tin nhắn cho ${receiverId}`);
      
      // Gửi thông báo đến người nhận
      const receiverSocketId = this.onlineUsers.get(receiverId);
      if (receiverSocketId) {
        this.io.to(receiverSocketId).emit('user_typing', { senderId });
      }
    } catch (error) {
      console.error('Error in typing event:', error);
    }
  }

  // Xử lý sự kiện người dùng ngừng gõ
  handleStopTyping(socket, data) {
    try {
      const { senderId, receiverId } = data;
      
      if (!senderId || !receiverId) {
        return;
      }

      // Gửi thông báo đến người nhận
      const receiverSocketId = this.onlineUsers.get(receiverId);
      if (receiverSocketId) {
        this.io.to(receiverSocketId).emit('user_stop_typing', { senderId });
      }
    } catch (error) {
      console.error('Error in stop typing event:', error);
    }
  }

  // Xử lý khi người dùng ngắt kết nối
  handleDisconnect(socket) {
    try {
      // Tìm và xóa người dùng khỏi danh sách online
      for (const [userId, socketId] of this.onlineUsers.entries()) {
        if (socketId === socket.id) {
          this.onlineUsers.delete(userId);
          console.log(`User disconnected: ${userId}`);
          break;
        }
      }

      // Cập nhật danh sách người dùng online
      this.broadcastOnlineUsers();
    } catch (error) {
      console.error('Error in disconnect handler:', error);
    }
  }

  // Gửi danh sách người dùng đang online đến tất cả client
  broadcastOnlineUsers() {
    try {
      const onlineUserIds = Array.from(this.onlineUsers.keys());
      this.io.emit('online_users', { users: onlineUserIds });
    } catch (error) {
      console.error('Error broadcasting online users:', error);
    }
  }

  // Đánh dấu tin nhắn đã đọc
  async markMessagesAsRead(conversationId, userId) {
    try {
      await MessageModel.updateMany(
        { 
          conversationId,
          receiverId: userId,
          readStatus: false
        },
        { readStatus: true }
      );

      // Thông báo cho người gửi rằng tin nhắn đã được đọc
      const conversation = await ConversationModel.findById(conversationId);
      if (!conversation) return false;
      
      const senderId = conversation.participants.find(id => id.toString() !== userId.toString());
      
      if (senderId) {
        const senderSocketId = this.onlineUsers.get(senderId);
        if (senderSocketId) {
          this.io.to(senderSocketId).emit('messages_read', { conversationId, readBy: userId });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }
}

module.exports = ChatService;
