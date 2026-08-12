import axios from "axios";
import { API_BASE } from "./config.js";

export const axiosInstance = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  try {
    const rawUser = localStorage.getItem("hackathon_user");
    if (rawUser) {
      config.headers["x-hackathon-user"] = encodeURIComponent(rawUser);
    }
  } catch (e) {
    // ignore
  }
  return config;
});
