import axios from "axios";
import { API_BASE } from "./config.js";

export const axiosInstance = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});
