import { io } from 'socket.io-client';
import { BASE_URLS } from '../config';
import { store } from '../redux/store';

class ChatSocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {
      onMessage: null,
      onTyping: null,
      onStopTyping: null,
      onOnlineUsers: null,
      onMessagesRead: null,
      onError: null,
      onConnect: null,
      onDisconnect: null
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnecting = false;
  }

  // Kết nối đến server Socket.IO
  connect() {
    if (this.socket && this.socket.connected) {
      console.log("Socket đã kết nối:", this.socket.id);
      return;
    }
    
    if (this.isConnecting) {
      console.log("Đang trong quá trình kết nối, không tạo kết nối mới");
      return;
    }

    this.isConnecting = true;
    const state = store.getState();
    const token = state.auth.token;
    
    if (!token) {
      console.error('Không thể kết nối: Chưa đăng nhập');
      this.isConnecting = false;
      return;
    }

    // Đóng socket cũ nếu còn tồn tại
    if (this.socket) {
      console.log("Đóng kết nối cũ trước khi tạo kết nối mới");
      this.socket.close();
      this.socket = null;
    }

    console.log("Đang kết nối đến Socket.IO server:", BASE_URLS.SOCKET_IO);
    
    this.socket = io(BASE_URLS.SOCKET_IO, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true
    });

    this.setupListeners();
  }

  // Thiết lập các event listener cho socket
  setupListeners() {
    if (!this.socket) return;

    // Xử lý sự kiện kết nối thành công
    this.socket.on('connect', () => {
      console.log('Socket connected successfully!', this.socket.id);
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      // Đăng ký người dùng
      const state = store.getState();
      const user = state.auth.user;
      
      if (user) {
        console.log("Đăng ký user với socket server:", user.username);
        this.socket.emit('register', {
          userID: user.userID,
          username: user.username
        });
      }

      if (this.callbacks.onConnect) {
        this.callbacks.onConnect();
      }
    });

    // Xử lý sự kiện đăng ký thành công
    this.socket.on('registered', (data) => {
      console.log('Registered with socket server:', data);
    });

    // Xử lý sự kiện connect_error
    this.socket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
      this.isConnecting = false;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Thử kết nối lại lần ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        setTimeout(() => this.connect(), 2000);
      }
    });

    // Xử lý sự kiện nhận tin nhắn
    this.socket.on('receive_message', (message) => {
      console.log('Received message via socket:', message);
      if (this.callbacks.onMessage) {
        this.callbacks.onMessage(message);
      }
    });

    // Xử lý sự kiện người dùng đang gõ
    this.socket.on('user_typing', (data) => {
      console.log('User typing:', data);
      if (this.callbacks.onTyping) {
        this.callbacks.onTyping(data);
      }
    });

    // Xử lý sự kiện người dùng ngừng gõ
    this.socket.on('user_stop_typing', (data) => {
      console.log('User stop typing:', data);
      if (this.callbacks.onStopTyping) {
        this.callbacks.onStopTyping(data);
      }
    });

    // Xử lý sự kiện cập nhật danh sách người dùng online
    this.socket.on('online_users', (data) => {
      console.log('Online users:', data);
      if (this.callbacks.onOnlineUsers) {
        this.callbacks.onOnlineUsers(data.users);
      }
    });

    // Xử lý sự kiện tin nhắn đã đọc
    this.socket.on('messages_read', (data) => {
      console.log('Messages read:', data);
      if (this.callbacks.onMessagesRead) {
        this.callbacks.onMessagesRead(data);
      }
    });

    // Xử lý sự kiện lỗi
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    });

    // Xử lý sự kiện ngắt kết nối
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnecting = false;
      
      if (this.callbacks.onDisconnect) {
        this.callbacks.onDisconnect(reason);
      }
    });
  }

  // Gửi tin nhắn
  sendMessage(data) {
    if (!this.socket) {
      console.log("Socket chưa được khởi tạo, đang kết nối lại...");
      this.connect();
      // Lưu tin nhắn và thử gửi lại sau khi kết nối
      setTimeout(() => this.sendMessage(data), 1000);
      return false;
    }
    
    if (!this.socket.connected) {
      console.error('Socket not connected, reconnecting...');
      this.connect();
      // Lưu tin nhắn và thử gửi lại sau khi kết nối
      setTimeout(() => this.sendMessage(data), 1000);
      return false;
    }

    console.log("Sending message via socket:", data);
    this.socket.emit('send_message', data);
    return true;
  }

  // Gửi thông báo đang gõ
  sendTyping(senderId, receiverId) {
    if (!this.socket || !this.socket.connected) {
      this.connect();
      return;
    }

    this.socket.emit('typing', { senderId, receiverId });
  }

  // Gửi thông báo ngừng gõ
  sendStopTyping(senderId, receiverId) {
    if (!this.socket || !this.socket.connected) {
      this.connect();
      return;
    }

    this.socket.emit('stop_typing', { senderId, receiverId });
  }

  // Đăng ký các callback để xử lý các sự kiện
  registerCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Kiểm tra trạng thái kết nối
  isConnected() {
    return !!(this.socket && this.socket.connected);
  }

  // Ngắt kết nối
  disconnect() {
    if (this.socket) {
      console.log("Đóng kết nối socket");
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }
  
  // Làm mới kết nối
  refreshConnection() {
    console.log("Làm mới kết nối socket");
    this.disconnect();
    this.connect();
  }
}

// Tạo và xuất instance duy nhất
const chatSocketService = new ChatSocketService();
export default chatSocketService;
