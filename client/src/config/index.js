// Các port dịch vụ ban đầu - giữ lại để tham khảo
// export const SERVICE_PORTS = {
//     AUTH_SERVICE: 5000,
//     USER_SERVICE: 5005,
//     SOCIAL_SERVICE: 5004,
//     CHAT_SERVICE: 5555,
//     POST_SERVICE: 5003,
// };

// export const BASE_URLS = {
//     AUTH_SERVICE: `http://localhost:${SERVICE_PORTS.AUTH_SERVICE}`,
//     USER_SERVICE: `http://localhost:${SERVICE_PORTS.USER_SERVICE}`,
//     SOCIAL_SERVICE: `http://localhost:${SERVICE_PORTS.SOCIAL_SERVICE}`,
//     CHAT_SERVICE: `http://localhost:${SERVICE_PORTS.CHAT_SERVICE}`,
//     POST_SERVICE: `http://localhost:${SERVICE_PORTS.POST_SERVICE}`,
// };

// Cấu hình mới sử dụng API Gateway
export const GATEWAY_PORT = 9999;
export const GATEWAY_URL = `http://localhost:${GATEWAY_PORT}`;

// Đường dẫn cho các service qua gateway
export const SERVICE_PATHS = {
    AUTH_SERVICE: 'auth',
    USER_SERVICE: 'users',
    SOCIAL_SERVICE: 'social',
    CHAT_SERVICE: 'chat',
    POST_SERVICE: 'post', // Đã sửa từ 'posts' thành 'post'
};

// Cấu hình base URL để client gọi API
export const BASE_URLS = {
    // Chú ý: Không thêm "/" vào cuối để tránh lặp đường dẫn khi kết hợp với API path
    AUTH_SERVICE: `${GATEWAY_URL}/${SERVICE_PATHS.AUTH_SERVICE}`,
    USER_SERVICE: `${GATEWAY_URL}/${SERVICE_PATHS.USER_SERVICE}`,
    SOCIAL_SERVICE: `${GATEWAY_URL}/${SERVICE_PATHS.SOCIAL_SERVICE}`,
    CHAT_SERVICE: `${GATEWAY_URL}/${SERVICE_PATHS.CHAT_SERVICE}`,
    POST_SERVICE: `${GATEWAY_URL}/${SERVICE_PATHS.POST_SERVICE}`,
    SOCKET_IO: GATEWAY_URL, // Cho WebSocket/Socket.IO
};
