import { createAsyncThunk } from "@reduxjs/toolkit";
import { get, post } from "../../services/chat.api.service";
import ENDPOINT from "../../constants/endpoint";

// Gửi tin nhắn
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      console.log("Sending message:", messageData);
      
      const response = await post(ENDPOINT.SEND_MESSAGE, messageData, token);
      console.log("Message response:", response.data);
      
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      return rejectWithValue(error.response?.data || { message: "Lỗi gửi tin nhắn" });
    }
  }
);

// Lấy danh sách tin nhắn
export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (conversationId, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      
      const endpoint = `${ENDPOINT.SHOW_LIST_MESSAGE}/${conversationId}`;
      console.log("Getting messages from endpoint:", endpoint);
      
      const response = await get(endpoint, token);
      return response.data;
    } catch (error) {
      console.error("Error getting messages:", error);
      return rejectWithValue(error.response?.data || { message: "Lỗi lấy tin nhắn" });
    }
  }
);

// Lấy danh sách các cuộc hội thoại
export const getListMessage = createAsyncThunk(
  "chat/getListMessage",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      
      console.log("Getting list message from endpoint:", ENDPOINT.SHOW_LIST_MESSAGE);
      const response = await get(ENDPOINT.SHOW_LIST_MESSAGE, token);
      return response.data;
    } catch (error) {
      console.error("Error getting list message:", error);
      return rejectWithValue(error.response?.data || { message: "Lỗi lấy danh sách tin nhắn" });
    }
  }
);

// Lấy hộp tin nhắn với một người dùng cụ thể
export const getBoxMessage = createAsyncThunk(
  "chat/getBoxMessage",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      
      const endpoint = `${ENDPOINT.SHOW_LIST_BOX_MESSAGE}/${userId}`;
      console.log("Getting box message from endpoint:", endpoint);
      
      const response = await get(endpoint, token);
      return response.data;
    } catch (error) {
      console.error("Error getting box message:", error);
      return rejectWithValue(error.response?.data || { message: "Lỗi lấy hộp tin nhắn" });
    }
  }
);

// Lấy gợi ý bình luận từ AI
export const getCommentSuggestions = createAsyncThunk(
  "chat/getCommentSuggestions",
  async (data, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      
      console.log("Getting comment suggestions for:", data);
      const response = await post(ENDPOINT.GET_COMMENT_SUGGESTIONS, data, token);
      return response.data;
    } catch (error) {
      console.error("Error getting comment suggestions:", error);
      return rejectWithValue(error.response?.data || { message: "Lỗi lấy gợi ý bình luận" });
    }
  }
);


