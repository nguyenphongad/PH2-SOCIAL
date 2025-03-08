import axios from "axios"

const instance = axios.create({
    baseURL: "http://localhost:5000"
})

instance.interceptors.response.use(
    // Xử lý khi response thành công
    response => {
        return response;
    },
    // Xử lý khi có lỗi
    (error) => {
        if (error.response) {
            // Lỗi từ phía server (có response)
            console.error('Lỗi Response:', {
                status: error.response.status,
                data: error.response.data,
                message: error.message
            });
        } else if (error.request) {
            // Lỗi không nhận được response
            console.error('Lỗi Request:', error.request);
        } else {
            // Lỗi trong quá trình thiết lập request
            console.error('Lỗi:', error.message);
        }
        return Promise.reject(error);
    }
);


export default instance