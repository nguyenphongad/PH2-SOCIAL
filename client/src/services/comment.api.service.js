import axios from 'axios';
import { BASE_URLS } from '../config';

// Base URL cho chat service (sẽ chứa endpoint cho AI)
const API_BASE_URL = BASE_URLS.CHAT_SERVICE;

// POST request
export const post = async (endpoint, data, token = null) => {
    const headers = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
            headers
        });
        return response;
    } catch (error) {
        throw error;
    }
};
