import instance from '../config/social.axios.config';

export const get = async (uri,token, params) => {
    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        // console.log('Headers:', headers.Authorization );

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

export const del = async (uri, data, token) => {
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




// Example usage functions
// export const fetchBannerData = () => api.get<{ result: BannerData[] }>(ENDPOINTS.BANNER);
// export const getCategories = () => api.get<{ result: Category[] }>(ENDPOINTS.CATEGORIES);
// export const loginUser = (credentials: Credentials) => api.post<LoginResponse>(ENDPOINTS.LOGIN, credentials);
// export const getAdvertisementById = (id: number) => api.get(`${ENDPOINTS.ADVERTISEMENT}/${id}`);
// export const getAllReviewsAdvertisementById = (id: number) => api.get(`${ENDPOINTS.REVIEWS}/${id}`);