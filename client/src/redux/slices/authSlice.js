import { createSlice } from "@reduxjs/toolkit";
import { loginUser } from "../thunks/authThunk";

const initialState = {
    user: null,
    token: localStorage.getItem("token"),
    status: null,
    isLogin: false
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, state => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                console.log(action.payload)
                state.token = action.payload.token;
                state.isLogin = true;
                localStorage.setItem("token", action.payload.token)
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

    }
})

// export const { loginStart, loginSuccess, logout } = authSlice.actions
export default authSlice.reducer