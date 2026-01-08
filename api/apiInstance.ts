import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";
import { tokenService } from "./services/apiService";

// Extend axios config to support retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Client": "mobile",
  },
});

// Public endpoints (NO auth required)
const publicEndpoints = [
  "/auth/login",
  "/reset-password/initiate",
  "/reset-password/verify",
  "/reset-password/submit",
  "/auth/refresh-token",
];

/* ============================================================
   REFRESH TOKEN STATE
============================================================ */
let isRefreshing = false;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token as string);
    }
  });

  failedQueue = [];
};

/* ============================================================
   REFRESH TOKEN CALL
============================================================ */
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = await tokenService.getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const response = await axios.post(
    `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token`,
    {
      refreshToken,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Client": "mobile",
      },
    }
  );

  const { accessToken } = response.data;

  await tokenService.setTokens(accessToken);

  console.log("Token refreshed");

  return accessToken;
};

/* ============================================================
   REQUEST INTERCEPTOR
============================================================ */
api.interceptors.request.use(
  async (config: CustomAxiosRequestConfig) => {
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (isPublicEndpoint) {
      return config;
    }

    const accessToken = await tokenService.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================================================
   RESPONSE INTERCEPTOR
============================================================ */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    const isUnauthorized = error.response?.status === 401;
    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh-token");

    if (isUnauthorized && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        await tokenService.clearTokens();
        router.replace("/login");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
