import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const PRODUCT_API_URL = `${API_BASE_URL}/products`;

export const getAllProducts = async () => {
    const response = await axios.get(PRODUCT_API_URL);
    return response.data;
};

export const searchProducts = async (keyword) => {
    const response = await axios.get(`${PRODUCT_API_URL}/search`, {
        params: { keyword }
    });
    return response.data;
};

export const getProductById = async (productId) => {
    const response = await axios.get(`${PRODUCT_API_URL}/${productId}`);
    return response.data;
};

export const getAdminProductById = async (productId) => {
    const response = await axios.get(`${API_BASE_URL}/admin/products/${productId}`);
    return response.data;
};

export const getProductsBySeller = async (sellerId) => {
    const response = await axios.get(`${PRODUCT_API_URL}/seller/${sellerId}`);
    return response.data;
};

export const createProduct = async (productData) => {
    const response = await axios.post(PRODUCT_API_URL, productData);
    return response.data;
};

export const updateProduct = async (productId, productData) => {
    const response = await axios.put(`${PRODUCT_API_URL}/${productId}`, productData);
    return response.data;
};

export const deleteProduct = async (productId) => {
    await axios.delete(`${PRODUCT_API_URL}/${productId}`);
};

export const uploadProductImage = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await axios.post(
        `${API_BASE_URL}/upload`,
        formData
    );

    return response.data;
};
