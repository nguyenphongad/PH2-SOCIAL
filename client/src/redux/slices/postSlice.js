// File: client/src/redux/slices/postSlice.js
import { createSlice } from "@reduxjs/toolkit";
// Import cả hai thunk
import { loadFeed, toggleLikePostThunk } from "../thunks/postThunk"; // Đảm bảo đường dẫn đúng

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    items: [], // Mảng chứa các bài đăng
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' cho loadFeed
    error: null,    // Lỗi của loadFeed
    likeStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' cho toggleLike
    likeError: null,    // Lỗi của toggleLike
  },
  reducers: {
    // Bạn có thể thêm các reducers đồng bộ ở đây nếu cần
    // Ví dụ: clearPosts: (state) => { state.items = []; state.status = 'idle'; }
  },
  extraReducers: builder => {
    builder
      // --- Xử lý loadFeed ---
      .addCase(loadFeed.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadFeed.fulfilled, (state, action) => {
        state.status = "succeeded";
        // action.payload là mảng các bài đăng từ API getFeedPosts
        // Mỗi post trong action.payload đã có trường isLikedByCurrentUser
        state.items = action.payload;
      })
      .addCase(loadFeed.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // --- Xử lý toggleLikePostThunk ---
      .addCase(toggleLikePostThunk.pending, (state) => {
        state.likeStatus = "loading";
        state.likeError = null;
      })
      .addCase(toggleLikePostThunk.fulfilled, (state, action) => {
        state.likeStatus = "succeeded";
        // action.payload là object { message, isLikedByCurrentUser, post } từ API toggleLikePost
        const { post: updatedPostFromAPI, isLikedByCurrentUser: isLikedByCurrentUserFromAPI } = action.payload;

        // Tìm index của bài đăng cần cập nhật trong mảng items
        const index = state.items.findIndex(p => p._id === updatedPostFromAPI._id);

        if (index !== -1) {
          // Cập nhật bài đăng trong Redux store
          // Đảm bảo ghi đè đúng các trường và thêm isLikedByCurrentUser
          state.items[index] = {
            ...state.items[index], // Giữ lại các trường có thể không có trong updatedPostFromAPI (nếu có)
            ...updatedPostFromAPI, // Ghi đè bằng dữ liệu mới từ API (quan trọng nhất là mảng 'likes')
            isLikedByCurrentUser: isLikedByCurrentUserFromAPI // Gán trạng thái like mới
          };
        }
      })
      .addCase(toggleLikePostThunk.rejected, (state, action) => {
        state.likeStatus = "failed";
        state.likeError = action.payload;
        console.error("Lỗi toggle like trong slice:", action.payload);
        // Ở đây, optimistic update trong PostItem sẽ tự rollback
      });
  }
});

export default postsSlice.reducer;
