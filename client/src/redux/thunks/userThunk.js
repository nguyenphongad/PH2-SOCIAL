import { createAsyncThunk } from "@reduxjs/toolkit";
import { get, post } from "../../services/user.api.service";
import ENDPOINT from "../../constants/endpoint";

export const getUserProfile = createAsyncThunk(
    "user/getUserProfile",
    async (username, { rejectWithValue, getState }) => {
        try {

            const { token } = getState().auth;

            const res = await get(`${ENDPOINT.GET_USER_PROFILE}/${username}`, token);

            return res.data;


        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: "Lỗi không xác định thunk (user - server bị lỗi/chưa khởi động)" });
            }
        }
    }
);

export const getShowListFollowerUser = createAsyncThunk(
    "user/getShowListFollowerUser",
    async (userIDs, { rejectWithValue, getState }) => {
        try {
            const { token } = getState().auth;

            const res = await post(`${ENDPOINT.SHOW_LIST_FOLLOWER_USER}`, userIDs , token);

            // console.log("thunk " + res)

            return res.data


        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: "Lỗi không xác định (thunk user - server bị lỗi/chưa khởi động)" });
            }
        }
    }
);

export const getShowListFollowingUser = createAsyncThunk(
    "user/getShowListFollowingUser",
    async (userIDs, { rejectWithValue, getState }) => {
        try {
            const { token } = getState().auth;

            const res = await post(`${ENDPOINT.SHOW_LIST_FOLLOWING_USER}`, userIDs, token);

            return res.data;

        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: "Lỗi không xác định (thunk user - server bị lỗi/chưa khởi động)" });
            }
        }
    }
);
