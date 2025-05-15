import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import socialReducer from "./slices/socialSlice";
import postReducer from "./slices/postSlice";
import chatReducer from "./slices/chatSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        social: socialReducer,
        post: postReducer,
        chat: chatReducer
    }
});

export default store;