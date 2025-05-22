import { createAsyncThunk } from "@reduxjs/toolkit";
import { get, post, put, del } from "../../services/post.api.service";
import ENDPOINT from "../../constants/endpoint";

// Tạo bài đăng mới
export const createPost = createAsyncThunk(
  "posts/create",
  async (postData, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await post(ENDPOINT.CREATE_POST, postData, token);
      console.log("thunk ", response)
      return response.data;
    } catch (err) {
      console.log(err)
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Lấy feed bài đăng
export const loadFeed = createAsyncThunk(
  "posts/loadFeed",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await get(ENDPOINT.GET_FEED_POSTS, token);
      return response.data.feedPosts;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Lấy bài đăng theo username
export const getUserPosts = createAsyncThunk(
  "posts/getUserPosts",
  async (username, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await get(`${ENDPOINT.GET_USER_POSTS}/${username}`, token);
      return response.data.posts;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Lấy chi tiết bài đăng
export const getPostDetail = createAsyncThunk(
  "posts/getPostDetail",
  async (postId, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      console.log("Fetching post detail for ID:", postId);
      const response = await get(`${ENDPOINT.GET_POST_DETAIL}/${postId}`, token);
      
      if (!response.data || !response.data.post) {
        console.error("No post data in response");
        return rejectWithValue({ message: "Không tìm thấy bài viết" });
      }
      
      console.log("Post detail response:", response.data.post);
      return response.data.post;
    } catch (err) {
      console.error("Error fetching post detail:", err);
      return rejectWithValue(err.response?.data || { message: "Lỗi khi tải bài viết" });
    }
  }
);

// Cập nhật bài đăng
export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ postId, updatedData }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await put(`${ENDPOINT.UPDATE_POST}/${postId}`, updatedData, token);
      // Cập nhật để sử dụng response.data.post thay vì response.data
      return response.data.post;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Xóa bài đăng
export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await del(`${ENDPOINT.DELETE_POST}/${postId}`, token);
      return { postId, message: response.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Like/unlike bài đăng
export const toggleLike = createAsyncThunk(
  "posts/toggleLike",
  async (postId, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      // Sửa lại đường dẫn để khớp với route: /:postId/likes
      const response = await post(`/${postId}${ENDPOINT.LIKE_POST}`, {}, token);
      return { postId, message: response.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thêm bình luận
export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, content }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      // Sửa lại đường dẫn để khớp với route: /:postId/comments
      const response = await post(`/${postId}${ENDPOINT.ADD_COMMENT}`, { content }, token);
      console.log("Add comment response:", response.data);
      return response.data; // Trả về dữ liệu đầy đủ từ API
    } catch (err) {
      console.error("Error adding comment:", err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Lấy danh sách bình luận
export const getComments = createAsyncThunk(
  "posts/getComments",
  async (postId, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      // Sửa lại đường dẫn để khớp với route: /:postId/comments
      const response = await get(`/${postId}${ENDPOINT.GET_COMMENTS}`, token);
      return { postId, comments: response.data.comments };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Tìm kiếm bài đăng
export const searchPosts = createAsyncThunk(
  "posts/searchPosts",
  async (keyword, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await get(`${ENDPOINT.SEARCH_POSTS}?keyword=${keyword}`, token);
      return response.data.searchPosts;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
