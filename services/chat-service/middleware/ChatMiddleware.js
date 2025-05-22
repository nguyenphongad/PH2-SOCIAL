const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const sec = process.env.JWT_SECRET;

// Thêm timeout cho middleware
const MIDDLEWARE_TIMEOUT = 5000; // 5 giây

const chatMiddleware = async (req, res, next) => {
    console.log('Executing chat middleware');
    
    // Thiết lập timeout để tránh middleware bị treo
    const timeoutId = setTimeout(() => {
        if (!req.aborted) {
            req.aborted = true;
            console.log('Middleware timeout reached');
            if (!res.headersSent) {
                return res.status(408).json({ message: "Request timeout" });
            }
        }
    }, MIDDLEWARE_TIMEOUT);

    try {
        // Kiểm tra request đã đóng chưa
        if (req.aborted) {
            clearTimeout(timeoutId);
            return; // Không xử lý nếu request đã bị abort
        }

        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            clearTimeout(timeoutId);
            console.log('Auth header missing or invalid:', req.headers.authorization);
            return res.status(401).json({ message: "Token không tồn tại" });
        }

        console.log('Token found, validating...');
        
        // Giải mã token và kiểm tra tính hợp lệ
        const decoded = jwt.verify(token, sec);

        // Thêm thông tin người dùng vào request
        req.user = decoded;
        console.log('Token valid for user:', decoded.username);

        clearTimeout(timeoutId);
        next();
    } catch (error) {
        clearTimeout(timeoutId);
        
        // Kiểm tra nếu request đã bị aborted hoặc kết nối đã đóng
        if (req.aborted || req.socket?.destroyed) {
            console.log('Request was aborted or connection closed, skipping error response');
            return;
        }

        console.error('Authentication error:', error.name, error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token đã hết hạn' });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token không hợp lệ: ' + error.message });
        }

        return res.status(401).json({ message: 'Lỗi xác thực: ' + error.message });
    }
};

module.exports = chatMiddleware;
