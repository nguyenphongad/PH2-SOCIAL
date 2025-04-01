import { createAsyncThunk } from "@reduxjs/toolkit";
import { post, get } from "../../services/social.api.service";
import ENDPOINT from "../../constants/endpoint";


export const checkFollowStatus = createAsyncThunk(
    "follow_user/checkFollowStatus",
    async (username, { rejectWithValue, getState }) => {
        try {
            const { token } = getState().auth;  
            const response = await get(`${ENDPOINT.CHECK_FOLLOW_STATUS}/${username}`, token); 
            return response.data;   
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: "Lỗi không xác định - server bị lỗi/chưa khởi động| name: checkfollow" });
            }
        }
    }
);

export const followUser = createAsyncThunk(
    "follow_user/follow",
    async (username, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const token = state.auth.token;

            if (!username) {
                return rejectWithValue("Không tìm thấy username!");
            }


            const response = await post(`${ENDPOINT.FOLLOW_USER}/${username}`,{}, token);

            return response.data;

        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: "Lỗi không xác định - server bị lỗi/chưa khởi động | follow" });
            }
        }
    }
)
