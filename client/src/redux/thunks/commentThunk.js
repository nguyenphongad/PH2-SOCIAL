import { createAsyncThunk } from "@reduxjs/toolkit";
import { post } from "../../services/comment.api.service";
import ENDPOINT from "../../constants/endpoint";

// Thunk để lấy đề xuất bình luận từ AI
export const getSuggestedComments = createAsyncThunk(
    "comments/getSuggestions",
    async (postContent, { getState, rejectWithValue }) => {
        const token = getState().auth.token;
        try {
            const response = await post(ENDPOINT.GET_COMMENT_SUGGESTIONS, { message: postContent }, token);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Không thể lấy đề xuất bình luận" });
        }
    }
);
