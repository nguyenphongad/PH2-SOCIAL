import axios from 'axios';
import { BASE_URLS } from '../config';

// Tạo instance axios với base URL cho chat service
const chatApi = axios.create({
  baseURL: BASE_URLS.CHAT_SERVICE
});

// Hàm set token cho mỗi request
export const setAuthToken = (token) => {
  if (token) {
    chatApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete chatApi.defaults.headers.common['Authorization'];
  }
};

// GET request
export const get = async (endpoint, token = null) => {
  if (token) {
    setAuthToken(token);
  }
  
  console.log(`Sending GET request to: ${BASE_URLS.CHAT_SERVICE}${endpoint}`);
  const response = await chatApi.get(endpoint);
  return response;
};

// POST request
export const post = async (endpoint, data, token = null) => {
  if (token) {
    setAuthToken(token);
  }
  
  console.log(`Sending POST request to: ${BASE_URLS.CHAT_SERVICE}${endpoint}`);
  const response = await chatApi.post(endpoint, data);
  return response;
};

// PUT request
export const put = async (endpoint, data, token = null) => {
  if (token) {
    setAuthToken(token);
  }
  
  const response = await chatApi.put(endpoint, data);
  return response;
};

// DELETE request
export const del = async (endpoint, token = null) => {
  if (token) {
    setAuthToken(token);
  }
  
  const response = await chatApi.delete(endpoint);
  return response;
};

export default chatApi;