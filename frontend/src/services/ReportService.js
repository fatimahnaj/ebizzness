import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/reports";

export const submitReport = async (reportData) => {
    const response = await axios.post(API_BASE_URL, reportData);
    return response.data;
};
