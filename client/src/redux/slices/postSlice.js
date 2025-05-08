import { createSlice } from "@reduxjs/toolkit";
import { loadFeed, toggleLikePostThunk } from "../thunks/postThunk";

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    likeStatus: "idle",
    likeError: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // --- Xử lý loadFeed ---
      .addCase(loadFeed.pending, (state) => {
        state.status = "loading";
        state.error = null; // Reset lỗi khi bắt đầu load mới
      })
      .addCase(loadFeed.fulfilled, (state, action) => {
        state.status = "succeeded";
        // action.payload là mảng các bài đăng từ API
        state.items = action.payload;
      })
      .addCase(loadFeed.rejected, (state, action) => {
        state.status = "failed";
        // action.payload là lỗi trả về từ rejectWithValue
        state.error = action.payload;
      })
      // --- Xử lý toggleLikePostThunk ---
      .addCase(toggleLikePostThunk.pending, (state) => {
        // Có thể set trạng thái loading riêng cho việc like nếu muốn hiển thị spinner
        state.likeStatus = "loading";
        state.likeError = null;
      })
      .addCase(toggleLikePostThunk.fulfilled, (state, action) => {
        state.likeStatus = "succeeded";
        // action.payload là object { message, liked, post } trả về từ API
        const updatedPost = action.payload.post;

        // Tìm index của bài đăng cần cập nhật trong mảng items
        const index = state.items.findIndex(post => post._id === updatedPost._id);

        // Nếu tìm thấy, cập nhật bài đăng đó trong state
        if (index !== -1) {
          state.items[index] = updatedPost;
        }
        // Nếu không tìm thấy (trường hợp hiếm), có thể không làm gì hoặc log lỗi
      })
      .addCase(toggleLikePostThunk.rejected, (state, action) => {
        state.likeStatus = "failed";
        // Lưu lỗi cụ thể của việc like/unlike
        state.likeError = action.payload;
        // Có thể thêm logic để rollback optimistic update nếu bạn có làm
        console.error("Lỗi toggle like:", action.payload); // Log lỗi ra console
      });
  }
});

export default postsSlice.reducer;
