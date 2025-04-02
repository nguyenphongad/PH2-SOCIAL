import {configureStore} from "@reduxjs/toolkit"
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import socialSlice from "./slices/socialSlice"
import chatSlice from "./reducers/chatReducer";

export const store = configureStore({
    reducer:{
        auth: authSlice,
        user: userSlice,
        social: socialSlice,
        chat: chatSlice
    },
    
})