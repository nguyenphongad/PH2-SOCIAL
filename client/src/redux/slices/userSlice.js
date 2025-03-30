import { createSlice } from '@reduxjs/toolkit';
import { getShowListFollowerUser, getShowListFollowingUser, getUserProfile } from '../thunks/userThunk';

const initialState = {
    user: null,
    status: 'idle',
    error: null,
    userFollower: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },


        clearUser: (state) => {
            state.user = null;
        },

        updatePostCount: (state, action) => {
            if (state.user) {
                state.user = {
                    ...state.user,
                    posts: action.payload
                };
            }
        },
        updateFollowers: (state, action) => {
            if (state.user) {
                state.user = {
                    ...state.user,
                    followers: action.payload
                };
            }
        },
        updateFollowing: (state, action) => {
            if (state.user) {
                state.user = {
                    ...state.user,
                    following: action.payload
                }
            }
        },



        setUserFollower: (state, action) => {
            state.userFollower = action.payload;

            // console.log("slice : " + action.payload)
        },


    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserProfile.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })


            // get following
            .addCase(getShowListFollowerUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;

            })
            .addCase(getShowListFollowerUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userFollower = action.payload;

                // console.log("slice succ: " + action.payload)
            })
            .addCase(getShowListFollowerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;

                // console.log("slice fail: " + action.payload)

            })


    },
});

export const { setUser, clearUser, updatePostCount, updateFollowers, updateFollowing, setUserFollower } = userSlice.actions;
export default userSlice.reducer;
