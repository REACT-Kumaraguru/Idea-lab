import axios from "axios";
import { API_BASE } from "./config.js";

export const axiosInstance = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

function getCsrfTokenFromCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Attach CSRF token on mutating requests
axiosInstance.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const token = getCsrfTokenFromCookie();
    if (token) {
      config.headers["x-csrf-token"] = token;
    }
  }
  return config;
});

// Self-healing CSRF interceptor
let isRefreshingCsrf = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "EBADCSRFTOKEN" &&
      !originalRequest._retry
    ) {
      if (isRefreshingCsrf) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["x-csrf-token"] = token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshingCsrf = true;

      try {
        const res = await axios.get(`${API_BASE}/api/csrf-token`, { withCredentials: true });
        const newToken = res.data?.csrfToken || getCsrfTokenFromCookie();
        processQueue(null, newToken);
        if (newToken) {
          originalRequest.headers["x-csrf-token"] = newToken;
        }
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshingCsrf = false;
      }
    }
    return Promise.reject(error);
  }
);

