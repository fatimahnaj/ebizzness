import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const SELLER_API_URL = `${API_BASE_URL}/sellers`;

export const getSellerProfile = async (sellerId) => {
    const response = await axios.get(`${SELLER_API_URL}/${sellerId}`);
    return response.data;
};
