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
      return response.data;
    } catch (err) {
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
      const response = await get(`${ENDPOINT.GET_POST_DETAIL}/${postId}`, token);
      return response.data.post;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
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
      const response = await post(`${ENDPOINT.LIKE_POST}/${postId}`, {}, token);
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
      const response = await post(`${ENDPOINT.ADD_COMMENT}/${postId}`, { content }, token);
      return response.data;
    } catch (err) {
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
      const response = await get(`${ENDPOINT.GET_COMMENTS}/${postId}`, token);
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
