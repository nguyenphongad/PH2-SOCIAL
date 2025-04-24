import instance from "../config/post.axios.config";

export const fetchPosts = async (token, params = {}) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await instance.get("/post/feed", { headers, params });
  // backend trả về { feedPosts: [...] }
  return res.data.feedPosts;
};
