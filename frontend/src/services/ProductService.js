import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/products"

export const getAllProducts = async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
};

export const searchProducts = async (keyword) => {
    const response = await axios.get(`${API_BASE_URL}/search`, {
        params: { keyword }
    });
    return response.data;
};

export const getProductById = async (productId) => {
    const response = await axios.get(`${API_BASE_URL}/${productId}`);
    return response.data;
};

export const getProductsBySeller = async (sellerId) => {
    const response = await axios.get(`${API_BASE_URL}/seller/${sellerId}`);
    return response.data;
};