import { createAsyncThunk } from "@reduxjs/toolkit";
import { get, post } from "../../services/chat.api.service";
import ENDPOINT from "../../constants/endpoint";

// Lấy danh sách tin nhắn từ một cuộc hội thoại cụ thể
export const getMessages = createAsyncThunk(
  "messages/getMessages",
  async ({conversationId}, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;

      const res = await get(`${ENDPOINT.SHOW_LIST_MESSAGE}/${conversationId}`, token);
      console.log("Tin nhắn đã nhận:", res.data);
      return res.data;

    } catch (error) {
      console.error("Error fetching messages:", error);
      
      return rejectWithValue({
        message: error.response?.data?.message || "Không thể tải tin nhắn",
        error: error.message
      });
    }
  }
);

// Lấy danh sách cuộc hội thoại (sửa đổi: không cần tham số)
export const getListMessage = createAsyncThunk(
  "messages/getListMessage",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      console.log("Đang gọi API với endpoint:", ENDPOINT.SHOW_LIST_MESSAGE);

      const res = await get(ENDPOINT.SHOW_LIST_MESSAGE, token);
      console.log("Kết quả từ API danh sách tin nhắn:", res.data);
      return res.data;

    } catch (error) {
      console.error("Chi tiết lỗi:", error);
      
      return rejectWithValue({
        message: error.response?.data?.message || "Không thể tải danh sách chat",
        status: error.response?.status,
        error: error.message
      });
    }
  }
);

// Lấy hoặc tạo hộp thoại với một người dùng cụ thể
export const getBoxMessage = createAsyncThunk(
  "messages/getBoxMessage",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;

      const res = await get(`${ENDPOINT.SHOW_LIST_BOX_MESSAGE}/${userId}`, token);
      console.log("Kết quả từ API hộp thoại:", res.data);
      return res.data;

    } catch (error) {
      console.error("Error fetching message box:", error);
      
      return rejectWithValue({
        message: error.response?.data?.message || "Không thể tải hộp thoại",
        status: error.response?.status,
        error: error.message
      });
    }
  }
);

// Gửi tin nhắn
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({receiverId, message}, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;

      const res = await post(ENDPOINT.SEND_MESSAGE, {
        receiverId,
        message
      }, token);
      
      return res.data;

    } catch (error) {
      console.error("Error sending message:", error);
      
      return rejectWithValue({
        message: error.response?.data?.message || "Không thể gửi tin nhắn",
        error: error.message
      });
    }
  }
);


