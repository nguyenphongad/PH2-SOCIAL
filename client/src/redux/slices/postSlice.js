import { createSlice } from "@reduxjs/toolkit";
import { loadFeed } from "../thunks/postThunk";

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    items: [],
    status: "idle",
    error: null
  },
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(loadFeed.pending, state => {
        state.status = "loading";
      })
      .addCase(loadFeed.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.items = payload;
      })
      .addCase(loadFeed.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
      })
});

export default postsSlice.reducer;
