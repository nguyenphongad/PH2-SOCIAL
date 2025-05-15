const jwt = require("jsonwebtoken");

const postMiddleware = (req, res, next) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Không có token, không được phép truy cập",isLogin: false });
        }

        const decoded = jwt.verify(token, process.env.JWTKEY);
        req.user = decoded; // Gắn thông tin user vào request
        next();

    } catch (error) {
        console.error("Lỗi xác thực token:", error.message);
        return res.status(401).json({ message: "Token không hợp lệ" , isLogin:false});
    }
};

module.exports = postMiddleware;