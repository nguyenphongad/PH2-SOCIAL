import instance from "../config/post.axios.config";
import axios from 'axios';

export const fetchPosts = async (token, params = {}) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await instance.get("/post/feed", { headers, params });
  // backend trả về { feedPosts: [...] }
  return res.data.feedPosts;
};
export const toggleLikePostAPI = async (postId, token) => {
  // Sử dụng URL tương đối, proxy sẽ xử lý
  // Endpoint này là POST /post/:postId/like (theo PostRoute.js)
  const API_URL = `/post/${postId}/likes`;
  const config = {
      headers: {
          Authorization: `Bearer ${token}`,
      },
  };
  // API backend trả về { message, liked, post }
  const response = await axios.post(API_URL, {}, config); // Body rỗng vì không cần gửi dữ liệu
  return response.data; // Trả về { message, liked, post }
};