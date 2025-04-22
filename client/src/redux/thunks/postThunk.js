import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPosts } from "../../services/post.api.service";

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
