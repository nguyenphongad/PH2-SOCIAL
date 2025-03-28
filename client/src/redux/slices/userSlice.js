import { createSlice } from '@reduxjs/toolkit';
import { getUserProfile } from '../thunks/userThunk';

const initialState = {
    user: null,
    status: 'idle', 
    error: null,
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
                state.user.posts = action.payload;
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
                state.user.following = action.payload;
            }
        }
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

    },
});

export const { setUser, clearUser,updatePostCount, updateFollowers,updateFollowing } = userSlice.actions;
export default userSlice.reducer;
