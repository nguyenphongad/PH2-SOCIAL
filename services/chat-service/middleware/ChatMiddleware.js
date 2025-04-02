const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const sec = process.env.JWTKEY;

const chatMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Token không tồn tại" });
        }

        // Giải mã token và kiểm tra tính hợp lệ
        const decoded = jwt.verify(token, sec);

        // Thêm thông tin người dùng vào request để sử dụng ở các route sau
        req.body.userID = decoded?.userID;

        next();
    } catch (error) {
        console.error("Token không hợp lệ hoặc đã hết hạn:", error);

        return res.status(401).json({
            message: "Token không hợp lệ hoặc đã hết hạn",
        });
    }
};

module.exports = chatMiddleware;
