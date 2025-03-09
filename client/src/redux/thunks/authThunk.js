import { createAsyncThunk } from "@reduxjs/toolkit";
import { post } from "../../services/api.service";
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
                return rejectWithValue({ message: "Lỗi không xác định thunk" });
            }
        }
    }
);