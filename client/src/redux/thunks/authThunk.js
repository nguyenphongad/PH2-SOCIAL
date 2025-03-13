import { createAsyncThunk } from "@reduxjs/toolkit";
import { get, post } from "../../services/api.service";
import ENDPOINT from "../../constants/endpoint";

export const loginUser = createAsyncThunk(
    "auth-login/user",
    async (credentials, { rejectWithValue }) => {
        try {
            const res = await post(ENDPOINT.LOGIN_USER, credentials);
            if (!res.data?.token) {
                throw new Error("Token không hợp lệ");
            }
            return res.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: "Lỗi không xác định thunks - server bị lỗi/chưa khởi động" });
            }
        }
    }
);

export const checkToken = createAsyncThunk(
    "auth-checkToken/user",
    async ( token , { rejectWithValue }) => {
        try {
            // console.log(token);

            if (!token) {
                return rejectWithValue({ message: "Không có token" });
            }

            const res = await get(ENDPOINT.CHECK_TOKEN, token);

            // console.log("Dữ liệu trả về từ API:", res.data);


            return res.data;
        } catch (error) {
            console.error("Lỗi khi gọi checkToken API:", error.response || error.message);

            return rejectWithValue(error.response?.data || { message: "Lỗi không xác định thunks - server bị lỗi/chưa khởi động" });
        }
    }
);