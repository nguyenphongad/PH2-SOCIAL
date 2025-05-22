const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const dotenv = require('dotenv');
const MessageRoutes = require('./routes/MessageRoute');
const { verifyToken } = require('./middleware/verifyToken');
const ChatService = require('./service/ChatService');
const findAvailablePort = require('./utils/portFinder');
const setupDebugRoutes = require('./utils/debug-routes');

// Cấu hình môi trường
dotenv.config();

const app = express();
const DEFAULT_PORT = process.env.PORT || 5555;

// Tạo HTTP server từ Express app
const server = http.createServer(app);

// Cấu hình CORS cho Express
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB với xử lý lỗi tốt hơn và thử lại
mongoose.set('strictQuery', false);

const connectWithRetry = () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ph2-social';
  console.log(`Attempting to connect to MongoDB at ${mongoURI}...`);
  
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Thời gian timeout khi chọn server
    socketTimeoutMS: 45000, // Thời gian chờ socket
  })
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    setupSocketIO();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Will retry connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000); // Thử lại sau 5 giây
  });
};

// Đưa việc khởi tạo Socket.IO vào hàm riêng để đảm bảo chỉ chạy sau khi MongoDB kết nối thành công
function setupSocketIO() {
  // Cấu hình Socket.IO với CORS
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    },
    pingTimeout: 60000, // Tăng thời gian timeout
    pingInterval: 25000, // Giảm thời gian kiểm tra kết nối
    transports: ['websocket', 'polling'], // Ưu tiên websocket
    allowEIO3: true // Cho phép Engine.IO phiên bản 3
  });

  // Middleware kiểm tra token cho Socket.IO
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      try {
        const decoded = verifyToken(token);
        socket.user = decoded;
        next();
      } catch (error) {
        return next(new Error('Authentication error: Invalid token'));
      }
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('General authentication error'));
    }
  });

  // Khởi tạo ChatService với io
  const chatService = new ChatService(io);
  
  // Gán io vào app để có thể sử dụng trong các routes
  app.set('socketio', io);
  app.set('chatService', chatService);
}

// Khai báo một health check endpoint trực tiếp để đảm bảo nó hoạt động
app.get('/health', (req, res) => {
  const status = {
    service: 'chat-service',
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  console.log('Health check called:', status);
  res.status(200).json(status);
});

// Đăng ký routes với tiền tố "/chat"
app.use('/chat', MessageRoutes);
// Đồng thời đăng ký routes ở root path để đảm bảo tương thích với cả hai cách gọi
// app.use('/', MessageRoutes);

// Thêm debug routes
setupDebugRoutes(app);

// Khởi động kết nối MongoDB
connectWithRetry();

// Khởi động server với xử lý lỗi cổng bị chiếm
const startServer = async () => {
  try {
    // Thử sử dụng cổng mặc định trước
    const port = await findAvailablePort(DEFAULT_PORT);
    
    server.listen(port, () => {
      console.log(`Server CHAT-SERVICE listening at port ${port}`);
      console.log(`Socket.IO server is ready to accept connections`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Xử lý lỗi không bắt được
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Không thoát process ngay lập tức để log có thể được ghi
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { app, server };
