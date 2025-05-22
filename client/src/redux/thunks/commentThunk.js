import { createAsyncThunk } from "@reduxjs/toolkit";
import { post } from "../../services/comment.api.service";
import ENDPOINT from "../../constants/endpoint";

// Thunk để lấy đề xuất bình luận từ AI
export const getSuggestedComments = createAsyncThunk(
    "comments/getSuggestions",
    async (postContent, { getState, rejectWithValue }) => {
        const token = getState().auth.token;
        try {
            console.log("Sending comment suggestion request with content:", postContent);
            
            // Đảm bảo có nội dung gửi đi
            if (!postContent || typeof postContent !== 'string' || postContent.trim() === '') {
                return {
                    suggestions: [
                        "Rất hay!",
                        "Cảm ơn bạn đã chia sẻ!",
                        "Thật thú vị!",
                        "Tôi hoàn toàn đồng ý với bạn",
                        "Chia sẻ thêm nữa đi bạn"
                    ]
                };
            }
            
            // Thay đổi từ message thành content
            const response = await post(ENDPOINT.GET_COMMENT_SUGGESTIONS, { 
                content: postContent    // Đổi từ message sang content
            }, token);
            
            console.log("API response:", response.data);
            
            // Kiểm tra nếu không có dữ liệu trả về
            if (!response.data || !response.data.suggestions || !Array.isArray(response.data.suggestions) || response.data.suggestions.length === 0) {
                return {
                    suggestions: [
                        "Rất hay!",
                        "Cảm ơn bạn đã chia sẻ!",
                        "Thật thú vị!",
                        "Tôi hoàn toàn đồng ý với bạn",
                        "Chia sẻ thêm nữa đi bạn"
                    ]
                };
            }
            
            return response.data;
        } catch (err) {
            console.error("Error getting suggestions:", err);
            
            // Luôn trả về dữ liệu mặc định thay vì rejectWithValue
            return {
                suggestions: [
                    "Rất hay!",
                    "Cảm ơn bạn đã chia sẻ!",
                    "Thật thú vị!",
                    "Tôi hoàn toàn đồng ý với bạn",
                    "Chia sẻ thêm nữa đi bạn"
                ]
            };
        }
    }
);

// Thêm các thunks về bình luận khác ở đây nếu có
