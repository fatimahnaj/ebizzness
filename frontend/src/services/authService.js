import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

// Helper to get the auth config header
const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const authService = {
    // === AuthController Endpoints ===
    register: async (registerData) => {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
        return response.data;
    },

    login: async (loginData) => {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    loginAdmin: async (adminLoginData) => {
        const response = await axios.post(`${API_BASE_URL}/auth/login-admin`, adminLoginData);
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    logout: async () => {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, getAuthConfig());
        localStorage.clear(); // Wipe token and profile choices cleanly
    },

    // === UserController Endpoints ===
    getProfile: async () => {
        const response = await axios.get(`${API_BASE_URL}/users/profile`, getAuthConfig());
        return response.data;
    },

    upgradeToSeller: async (data={}) => {
        const response = await axios.post(`${API_BASE_URL}/users/upgrade-to-seller`, data, getAuthConfig());
        return response.data;
    },

    switchRole: async (switchData) => {
        const response = await axios.post(`${API_BASE_URL}/users/switch-role`, switchData, getAuthConfig());
        return response.data;
    }
};

export default authService;
