import { createSlice } from "@reduxjs/toolkit";
import { checkToken, loginUser } from "../thunks/authThunk";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("USER_TOKEN");

// Kiểm tra token hợp lệ hay không
const isValidToken = (token) => {
    try {
        if (!token) return false;
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 > Date.now();
    } catch (error) {
        return false;
    }
};


const initialState = {
    user: null,
    token: isValidToken(token) ? token : null,
    status: null,
    isLogin: isValidToken(token),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null
            state.token = null;
            state.isLogin = false;
            localStorage.removeItem("USER_TOKEN");
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, state => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.status = "succeeded";
                state.token = action.payload.token;
                state.isLogin = true;
                localStorage.setItem("USER_TOKEN", action.payload.token);

            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(checkToken.pending, (state) => {
                state.status = "loading";
            })
            .addCase(checkToken.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                state.isLogin = true;
            })
            .addCase(checkToken.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
                state.isLogin = false; 
            });
    }
})


export const { logout } = authSlice.actions
export default authSlice.reducer