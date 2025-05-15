import instance from '../config/post.axios.config';

export const get = async (uri, token, params) => {
    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const res = await instance.get(uri, { headers, params });
        return res;
    } catch (error) {
        throw error;
    }
};

export const post = async (uri, data, token) => {
    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const res = await instance.post(uri, data, { headers });
        return res;
    } catch (error) {
        throw error;
    }
};

export const put = async (uri, data, token) => {
    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const res = await instance.put(uri, data, { headers });
        return res;
    } catch (error) {
        throw error;
    }
};

export const del = async (uri, token, data) => {
    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const res = await instance.delete(uri, { headers, data });
        return res;
    } catch (error) {
        throw error;
    }
};

export const patch = async (uri, data, token) => {
    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const res = await instance.patch(uri, data, { headers });
        return res;
    } catch (error) {
        throw error;
    }
};

// Hàm đặc biệt cho việc lấy feed posts
export const fetchPosts = async (token, params = {}) => {
    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        
        const res = await instance.get("/post/feed", { headers, params });
        return res.data.feedPosts;
    } catch (error) {
        throw error;
    }
};

