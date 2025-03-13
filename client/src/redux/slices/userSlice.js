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
            // .addCase(updateUserProfile.pending, (state) => {
            //     state.status = 'loading';
            //     state.error = null;
            // })
            // .addCase(updateUserProfile.fulfilled, (state, action) => {
            //     state.status = 'succeeded';
            //     state.user = action.payload;  // Update user with the new data
            // })
            // .addCase(updateUserProfile.rejected, (state, action) => {
            //     state.status = 'failed';
            //     state.error = action.payload;
            // });
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
