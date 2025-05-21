const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware - phải khai báo trước khi tạo Socket.IO instance
app.use(express.static('public'));

// Tăng giới hạn kích thước request và timeout 
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Xử lý lỗi request aborted tại middleware level
app.use((req, res, next) => {
  // Xử lý khi client đóng kết nối
  req.on('close', () => {
    req.aborted = true;
    console.log('Client closed connection');
  });
  
  // Xử lý khi có lỗi kết nối
  req.on('error', (err) => {
    req.aborted = true;
    console.error('Request error:', err);
  });
  
  next();
});

// Cấu hình CORS chi tiết hơn 
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Khởi tạo Socket.IO sau khi đã cấu hình middleware
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  maxHttpBufferSize: 1e8, // 100MB
  transports: ['websocket', 'polling'] 
});

// Import routes
const MessageRoute = require("./routes/MessageRoute");

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'chat-service',
    timestamp: new Date().toISOString()
  });
});

// Xử lý lỗi raw-body/body-parser
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request too large' });
    return;
  }

  if (err.name === 'BadRequestError' && err.message === 'request aborted') {
    console.log('Request aborted, no need to send response');
    return;
  }
  
  console.error('Chat service error:', err);
  
  // Kiểm tra kết nối còn mở không
  if (!res.headersSent && res.connection && !res.connection.destroyed) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message
    });
  }
});

// MongoDB Connection
mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
        server.listen(process.env.PORT, () => {
            console.log('server CHAT-SERVICE listening at port ' + process.env.PORT);
        });
    })
    .catch((error) => console.log(error));

// Socket.io Setup với xử lý lỗi
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    socket.on('sendMessage', (data) => {
        try {
            io.emit('newMessage', data);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Thiết lập routes API
app.use('/chat', MessageRoute);

// Export io instance
module.exports = io;
