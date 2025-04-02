import { createSlice } from "@reduxjs/toolkit";
import { getListMessage } from "../thunks/chatThunk";

const initialState = {
    chatData: null,
    status: "idle",
    error: null,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setChatData: (state, action) => {
            state.chatData = action.payload;
            
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getListMessage.pending, (state) => {
                state.status = "loading";
                state.error = null;

            })
            .addCase(getListMessage.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.chatData = action.payload;


            })
            .addCase(getListMessage.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;

                // console.log(action.payload)
            })
    }
})

export const { setChatData } = chatSlice.actions;
export default chatSlice.reducer;