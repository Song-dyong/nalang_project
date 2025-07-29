import axios from "axios";
import { API_ENDPOINT } from "../apis/config";

const axiosInstance = axios.create({
  baseURL: import.meta.env.BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && !config.headers?.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.headers?.skipAuth) {
    delete config.headers.skipAuth;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${API_ENDPOINT.AUTH}/refresh`,
            {
              refresh_token: refreshToken,
            },
            {
              headers: {
                skipAuth: true,
              },
            }
          );
          const newAccessToken = res.data.access_token;
          localStorage.setItem("access_token", newAccessToken);
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
