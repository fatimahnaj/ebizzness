import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const REPORT_API_URL = `${API_BASE_URL}/reports`;

export const submitReport = async (reportData) => {
    const response = await axios.post(REPORT_API_URL, reportData);
    return response.data;
};
