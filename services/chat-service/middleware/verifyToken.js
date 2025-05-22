const jwt = require('jsonwebtoken');

const verifyToken = (token) => {
  try {
    // Sử dụng JWT_SECRET từ biến môi trường hoặc fallback sang giá trị mặc định
    const secret = process.env.JWT_SECRET || 'MERN';
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    throw new Error('Invalid token: ' + error.message);
  }
};

module.exports = { verifyToken };
