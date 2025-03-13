import axios from "axios";

const userServiceInstance = axios.create({
    baseURL: "http://localhost:5001", // Đặt baseURL cho user-service
});

userServiceInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.error('Lỗi Response:', {
                status: error.response.status,
                data: error.response.data,
                message: error.message,
            });
        } else if (error.request) {
            console.error('Lỗi Request:', error.request);
        } else {
            console.error('Lỗi:', error.message);
        }
        return Promise.reject(error);
    }
);

export default userServiceInstance;
