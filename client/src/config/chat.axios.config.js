import axios from "axios";
import { BASE_URLS } from "./index";

const chatServiceInstance = axios.create({
    baseURL: BASE_URLS.CHAT_SERVICE,
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