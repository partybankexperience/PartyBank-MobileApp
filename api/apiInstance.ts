import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";
import { tokenService } from "./services/apiService";

// Extend InternalAxiosRequestConfig to include _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Create the Axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include access token and check expiration
api.interceptors.request.use(
  async (config: CustomAxiosRequestConfig) => {
    const hasValidToken = await tokenService.hasValidToken();

    // Check if token exists and is not expired
    if (!hasValidToken) {
      await tokenService.clearTokens();
      router.replace("/login");
      return Promise.reject(new Error("Token expired or not found"));
    }

    const accessToken = await tokenService.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log("Request with token:", accessToken.substring(0, 20) + "...");
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Handle 401 Unauthorized errors
    if (originalRequest && error.response?.status === 401) {
      await tokenService.clearTokens();
      router.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default api;
