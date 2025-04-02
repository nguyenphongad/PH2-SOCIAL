import axios from "axios";

const chatServiceInstance = axios.create({
    baseURL : "http://localhost:5555"
});

chatServiceInstance.interceptors.response.use(
    response => response,
    error=>{
        if(error.response){
            console.log("lỗi res : ",{
                status: error.response.status,
                data: error.response.data,
                message: error.message
            })
        }
        else if (error.request) {
            console.error('Lỗi Request:', error.request);
        } else {
            console.error('Lỗi:', error.message);
        }
        return Promise.reject(error);
    }
)

export default chatServiceInstance