import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/reviews";

export const createReview = async (reviewData) => {
    const response = await axios.post(API_BASE_URL, reviewData);
    return response.data;
};

export const getReviewsByProduct = async (productId) => {
    const response = await axios.get(`${API_BASE_URL}/product/${productId}`);
    return response.data;
};

export const getReviewsByBuyer = async (buyerId) => {
    const response = await axios.get(`${API_BASE_URL}/buyer/${buyerId}`);
    return response.data;
};

export const deleteReview = async (reviewId) => {
    await axios.delete(`${API_BASE_URL}/${reviewId}`);
};
