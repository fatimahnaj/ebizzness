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

export const createProduct = async (productData) => {
    const response = await axios.post(API_BASE_URL, productData);
    return response.data;
};

export const updateProduct = async (productId, productData) => {
    const response = await axios.put(`${API_BASE_URL}/${productId}`, productData);
    return response.data;
};

export const deleteProduct = async (productId) => {
    await axios.delete(`${API_BASE_URL}/${productId}`);
};

export const uploadProductImage = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await axios.post(
        "http://localhost:8080/api/upload",
        formData
    );

    return response.data;
};
