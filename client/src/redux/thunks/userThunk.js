import { createAsyncThunk } from "@reduxjs/toolkit";
import { get } from "../../services/user.api.service";
import ENDPOINT from "../../constants/endpoint";

export const getUserProfile = createAsyncThunk(
    "user/getUserProfile",
    async (username, { rejectWithValue }) => {
        try {

            const token = localStorage.getItem("USER_TOKEN");

            // console.log("thunk token "+ token);

            const res = await get(`${ENDPOINT.GET_USER_PROFILE}/${username}`, token);

            // console.log("thunk" + res)
            return res.data;


        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: "Lỗi không xác định - server bị lỗi/chưa khởi động" });
            }
        }
    }
);

