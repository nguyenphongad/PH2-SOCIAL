import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPosts, toggleLikePostAPI } from "../../services/post.api.service";

export const loadFeed = createAsyncThunk(
  "posts/loadFeed",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      // fetchPosts giờ trả về mảng feedPosts
      const posts = await fetchPosts(token);
      return posts;    // payload là mảng post
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const toggleLikePostThunk = createAsyncThunk(
  "posts/toggleLike",
  // Thunk nhận postId làm đối số
  async (postId, { getState, rejectWithValue }) => {
      const token = getState().auth.token; // Lấy token
      if (!token) {
          return rejectWithValue('Bạn cần đăng nhập để thực hiện hành động này.');
      }
      if (!postId) {
          return rejectWithValue('ID bài đăng không hợp lệ.');
      }

      try {
          // Gọi hàm API service đã tạo
          const data = await toggleLikePostAPI(postId, token);
          // API trả về { message, liked, post }
          // Trả về toàn bộ object data để slice có thể xử lý
          return data;
      } catch (err) {
          // Trả về lỗi từ server hoặc message lỗi chung
           return rejectWithValue(err.response?.data?.message || err.message || 'Lỗi khi thích/bỏ thích bài đăng');
      }
  }
);