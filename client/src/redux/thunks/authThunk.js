import { createAsyncThunk } from "@reduxjs/toolkit";
import { post } from "../../services/api.service";
import ENDPOINT from "../../constants/endpoint";

export const loginUser = createAsyncThunk(
    "auth-login/user",
    async (credentials, { rejectWithValue }) => {
        const res = await post(ENDPOINT.LOGIN_USER, credentials);
        try {
            if (!res.data?.token) {
                throw new Error("Token không hợp lệ")
            }
            return res.data;

        } catch (error) {
            return rejectWithValue(res.data, error);
        }
    }
)