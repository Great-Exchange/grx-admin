import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem("authToken");
    const requestUrl = error.config?.url || "";

    // Don't redirect when the login request itself fails.
    if (
      error.response?.status === 401 &&
      token &&
      !requestUrl.includes("/api/account/login/")
    ) {
      localStorage.removeItem("authToken");
      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
