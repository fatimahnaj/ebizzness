import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/sellers";

export const getSellerProfile = async (sellerId) => {
    const response = await axios.get(`${API_BASE_URL}/${sellerId}`);
    return response.data;
};