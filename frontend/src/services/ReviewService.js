import api from "./api";

export const createReview = async (reviewData) => {
    const response = await api.post("/reviews", reviewData);
    return response.data;
};

export const getReviewsByProduct = async (productId) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
};

export const getReviewsByBuyer = async (buyerId) => {
    const response = await api.get(`/reviews/buyer/${buyerId}`);
    return response.data;
};

export const deleteReview = async (reviewId) => {
    await api.delete(`/reviews/${reviewId}`);
};
