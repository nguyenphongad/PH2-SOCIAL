const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const winston = require('winston');
const fetch = require('node-fetch');

// Cấu hình môi trường
dotenv.config();

// Service status tracking (đã chuyển từ service-status.js)
const serviceStatus = {
  'auth-service': { status: 'unknown', lastChecked: null, healthEndpoint: '/health' },
  'user-service': { status: 'unknown', lastChecked: null, healthEndpoint: '/health' },
  'social-service': { status: 'unknown', lastChecked: null, healthEndpoint: '/health' },
  'post-service': { status: 'unknown', lastChecked: null, healthEndpoint: '/health' },
  'chat-service': { status: 'unknown', lastChecked: null, healthEndpoint: '/health' }
};

function updateServiceStatus(name, status) {
  if (serviceStatus[name]) {
    serviceStatus[name].status = status;
    serviceStatus[name].lastChecked = new Date();
  }
}

function getServiceStatus() {
  return { ...serviceStatus };
}

// Cấu hình logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'gateway.log' })
  ]
});

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'Authorization']
}));

app.use(express.json());

// Thêm middleware để xử lý timeout
app.use((req, res, next) => {
  // Set timeout cho request
  req.setTimeout(30000, () => {
    logger.error(`Request timeout: ${req.method} ${req.url}`);
    if (!res.headersSent) {
      res.status(504).json({ error: 'Gateway Timeout', message: 'Request took too long to process' });
    }
  });
  
  // Xử lý khi client đóng kết nối
  req.on('close', () => {
    logger.info(`Client closed connection: ${req.method} ${req.url}`);
  });
  
  next();
});

// Log tất cả các request
app.use((req, res, next) => {
  // Không log thông tin body cho các route đăng nhập vì có thể chứa mật khẩu
  const safeUrl = req.url.toLowerCase();
  const shouldLogBody = !safeUrl.includes('/login') && !safeUrl.includes('/register');
  
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    bodySize: req.body ? Object.keys(req.body).length : 0,
    // Chỉ log body ở các route an toàn
    ...(shouldLogBody && req.body ? { body: req.body } : {})
  });
  
  next();
});

// Cải thiện debug logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - Start`);
  
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Proxy routes cho Auth Service
app.use('/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  // Bỏ pathRewrite để đảm bảo đường dẫn được giữ nguyên
  pathRewrite: null,
  timeout: 60000, // Tăng timeout lên 60 giây
  proxyTimeout: 60000,
  onProxyReq: (proxyReq, req, res) => {
    // Sửa lỗi xử lý body
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      const bodyData = JSON.stringify(req.body);
      // Xóa header content-length cũ nếu có
      proxyReq.removeHeader('Content-Length');
      // Set content-length mới
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      // Gửi body
      proxyReq.write(bodyData);
      // Đảm bảo kết thúc request
      proxyReq.end();
    }
    
    logger.info({
      message: 'Proxying to Auth Service',
      method: req.method, 
      url: req.url,
      target: `${process.env.AUTH_SERVICE_URL}${req.url}`
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`Got response from Auth Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error to Auth Service: ${err.message}`);
    res.status(502).json({ 
      error: 'Bad Gateway', 
      details: err.message,
      service: 'auth'
    });
  }
}));

// Proxy routes cho User Service
app.use('/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/users': '/user' // Điều chỉnh nếu service sử dụng "user" thay vì "users"
  },
  timeout: 60000,
  proxyTimeout: 60000,
  onProxyReq: (proxyReq, req, res) => {
    // Xử lý body cho POST/PUT request
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.removeHeader('Content-Length');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
      proxyReq.end();
    }
    
    logger.info(`Redirecting to User Service: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error to User Service: ${err.message}`);
    res.status(502).json({ error: 'Bad Gateway', details: err.message });
  }
}));

// Proxy routes cho Social Service
app.use('/social', createProxyMiddleware({
  target: process.env.SOCIAL_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/social': '/social' // Sửa từ 'social' thành '/social' để giữ tiền tố
  },
  timeout: 60000,
  proxyTimeout: 60000,
  onProxyReq: (proxyReq, req, res) => {
    // Xử lý body cho POST/PUT request
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.removeHeader('Content-Length');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
      proxyReq.end();
    }
    
    logger.info(`Redirecting to Social Service: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error to Social Service: ${err.message}`);
    res.status(502).json({ error: 'Bad Gateway', details: err.message });
  }
}));

// Proxy routes cho Post Service
app.use('/post', createProxyMiddleware({
  target: process.env.POST_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/post': '/post' // Sửa từ 'post' thành '/post' để giữ tiền tố
  },
  timeout: 60000,
  proxyTimeout: 60000,
  onProxyReq: (proxyReq, req, res) => {
    // Xử lý body cho POST/PUT request
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.removeHeader('Content-Length');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
      proxyReq.end();
    }
    
    logger.info(`Redirecting to Post Service: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error to Post Service: ${err.message}`);
    res.status(502).json({ error: 'Bad Gateway', details: err.message });
  }
}));

// Proxy routes cho Chat Service
app.use('/chat', createProxyMiddleware({
  target: process.env.CHAT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/chat': '/chat' // Sửa từ 'chat' thành '/chat' để giữ tiền tố
  },
  timeout: 60000,
  proxyTimeout: 60000,
  onProxyReq: (proxyReq, req, res) => {
    // Xử lý body cho POST/PUT request
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.removeHeader('Content-Length');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
      proxyReq.end();
    }
    
    logger.info(`Redirecting to Chat Service: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error to Chat Service: ${err.message}`);
    res.status(502).json({ error: 'Bad Gateway', details: err.message });
  }
}));

// Comment phần WebSocket proxy vì chưa sử dụng
/*
// Websocket proxy cho Chat Service (Socket.IO)
app.use('/socket.io', createProxyMiddleware({
  target: process.env.CHAT_SERVICE_URL,
  changeOrigin: true,
  ws: true,
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`Redirecting WS to Chat Service: ${req.method} ${req.url}`);
  }
}));
*/

// Endpoint để kiểm tra trạng thái tất cả service
app.get('/services/status', (req, res) => {
  res.status(200).json({ 
    timestamp: new Date(),
    services: getServiceStatus()
  });
});

// Cập nhật Debug endpoint để hiển thị nhiều thông tin hơn
app.get('/debug/config', (req, res) => {
  res.status(200).json({
    gateway: {
      port: PORT,
      environment: process.env.NODE_ENV
    },
    services: {
      auth: process.env.AUTH_SERVICE_URL,
      user: process.env.USER_SERVICE_URL,
      social: process.env.SOCIAL_SERVICE_URL,
      post: process.env.POST_SERVICE_URL,
      chat: process.env.CHAT_SERVICE_URL
    },
    status: getServiceStatus()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Route mặc định
app.use('/', (req, res) => {
  res.status(200).json({ message: 'PH2-SOCIAL API Gateway' });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 9999;

// Khởi động server trực tiếp, không đợi health check
app.listen(PORT, () => {
  logger.info(`Gateway server running on port ${PORT}`);
  console.log(`Gateway server running on port ${PORT}`);
  
  // Kiểm tra kết nối sau khi khởi động (không chặn quá trình khởi động)
  setTimeout(() => {
    // Đợi 10 giây trước khi kiểm tra kết nối để cho các service khác thời gian khởi động
    logger.info('Waiting for services to start up...');
    checkServiceConnections();
  }, 10000);
});

// Kiểm tra kết nối đến tất cả service
async function checkServiceConnections() {
  const services = {
    'auth-service': process.env.AUTH_SERVICE_URL,
    'user-service': process.env.USER_SERVICE_URL,
    'social-service': process.env.SOCIAL_SERVICE_URL,
    'post-service': process.env.POST_SERVICE_URL,
    'chat-service': process.env.CHAT_SERVICE_URL
  };
  
  for (const [name, url] of Object.entries(services)) {
    try {
      // Thêm timeout cho fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const healthUrl = `${url}/health`;
      logger.info(`Testing connection to ${name} at ${healthUrl}`);
      
      const response = await fetch(healthUrl, {
        signal: controller.signal,
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }).catch(e => {
        logger.error(`Fetch error for ${name}: ${e.message}`);
        return null;
      });
      
      clearTimeout(timeoutId);
      
      if (response && response.ok) {
        updateServiceStatus(name, 'up');
        logger.info(`✅ Connection to ${name} successful`);
      } else {
        updateServiceStatus(name, 'down');
        logger.warn(`❌ Connection to ${name} failed`);
      }
    } catch (error) {
      updateServiceStatus(name, 'error');
      logger.error(`❌ Cannot connect to ${name}: ${error.message}`);
    }
  }
}
