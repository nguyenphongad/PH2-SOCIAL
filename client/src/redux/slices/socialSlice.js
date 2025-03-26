import { createSlice } from "@reduxjs/toolkit";

import { checkFollowStatus, followUser } from "../thunks/socialThunk";

const initialState = {
    user: null,
    isFollowing: false,
    status: "idle",
    error: null
}

const socialSlice = createSlice({
    name: "follow_user",
    initialState,
    reducers: {
        setFollowUser: (state, action) => {
            console.log("Action Payload: ", action.payload);

            state.user = action.payload;
        },
        setIsFollowing: (state, action) => {
            state.isFollowing = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder


            // check follow
            .addCase(checkFollowStatus.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(checkFollowStatus.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.isFollowing = action.payload.isFollowing;
                state.error = null;
            })
            .addCase(checkFollowStatus.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })


            //follow nguoi dung
            .addCase(followUser.pending, (state) => {
                state.status = "loading";
                state.error = null;

            })
            .addCase(followUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload;
                state.error = null;
            })
            .addCase(followUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })


    }
})

export const { setFollowUser,setIsFollowing } = socialSlice.actions;
export default socialSlice.reducer