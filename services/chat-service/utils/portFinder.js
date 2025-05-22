const net = require('net');

/**
 * Kiểm tra xem một cổng có đang được sử dụng không
 * @param {number} port - Cổng cần kiểm tra
 * @returns {Promise<boolean>} - True nếu cổng trống, false nếu đang được sử dụng
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false); // Cổng đã bị sử dụng
      } else {
        resolve(false); // Lỗi khác, coi như cổng không khả dụng
      }
    });
    
    server.once('listening', () => {
      // Đóng server và phát hành cổng
      server.close(() => {
        resolve(true); // Cổng khả dụng
      });
    });
    
    server.listen(port);
  });
}

/**
 * Tìm một cổng khả dụng, bắt đầu từ cổng được chỉ định
 * @param {number} startPort - Cổng bắt đầu kiểm tra
 * @param {number} maxAttempts - Số lần thử tối đa
 * @returns {Promise<number>} - Cổng khả dụng
 */
async function findAvailablePort(startPort = 5555, maxAttempts = 10) {
  let port = startPort;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const available = await isPortAvailable(port);
    
    if (available) {
      return port;
    }
    
    console.log(`Port ${port} is in use, trying port ${port + 1}`);
    port += 1;
    attempts += 1;
  }
  
  throw new Error(`Unable to find an available port after ${maxAttempts} attempts`);
}

module.exports = findAvailablePort;
