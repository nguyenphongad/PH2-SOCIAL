import { createAsyncThunk } from "@reduxjs/toolkit";
import { get, post } from "../../services/chat.api.service";
import ENDPOINT from "../../constants/endpoint";

export const getListMessage = createAsyncThunk(
    "chat/getListMessage",
    async (_, { rejectWithValue, getState }) => {
        try {
            const { token } = getState().auth;

            // console.log("token : " + token)

            const res = await post(`${ENDPOINT.SHOW_LIST_MESSAGE}`, {}, token);


            // console.log(res)

            return res.data

        } catch (error) {

            // console.log(error)

            if (error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: "Lỗi không xác định thunk (chat - server bị lỗi/chưa khởi động)" });
            }
        }
    }
)

