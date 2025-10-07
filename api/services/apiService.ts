import { StorageService } from "@/app/state/storageService";
import {
  EventsResponse,
  EventSummary,
  LoginRequest,
  LoginResponse,
  ResetPasswordInitiateResponse,
  ResetPasswordSubmitRequest,
  ResetPasswordSubmitResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "./type";
import api from "../apiInstance";

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", credentials);

    const data = await response.data;
    console.log("data", data);

    if (!data) {
      throw new Error(data.message || "Login failed");
    }
    return data;
  },
  resetPasswordInitiate: async (
    email: string
  ): Promise<ResetPasswordInitiateResponse> => {
    const response = await api.post("/reset-password/initiate", { email });

    const data = await response.data;

    console.log(data);
    if (!response.data) {
      throw new Error(data.message || "Failed to initiate password reset");
    }

    return data;
  },
  verifyOtp: async (request: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await api.post("/reset-password/verify", request);

    const data = await response.data;

    console.log("OTP Verification Response:", data);

    if (!response.data) {
      throw new Error(data.message || "Failed to verify OTP");
    }

    return data;
  },
  resetPasswordSubmit: async (
    request: ResetPasswordSubmitRequest
  ): Promise<ResetPasswordSubmitResponse> => {
    const response = await api.post("/reset-password/submit", request);

    const data = await response.data;

    console.log("Reset Password Response:", data);

    if (!response.data) {
      throw new Error(data.message || "Failed to reset password");
    }

    return data;
  },
};

export const scanApi = {
  getEvents: async (
    page: number = 1,
    pageSize: number = 20
  ): Promise<EventsResponse> => {
    const response = await api.get(
      `/scan/events?page=${page}&pageSize=${pageSize}`
    );

    const data = await response.data;

    if (!data) {
      throw new Error(data.message || "Failed to fetch events");
    }

    return data;
  },

  getEventSummary: async (eventId: string): Promise<EventSummary> => {
    const response = await api.get(`/events/${eventId}/summary`);

    const data = await response.data;

    if (!response.data) {
      throw new Error(data.message || "Failed to fetch event summary");
    }

    return data;
  },
};

export const tokenService = {
  setTokens: async (accessToken: string): Promise<void> => {
    await StorageService.setItem("accessToken", accessToken);
    await StorageService.setItem("tokenTimestamp", Date.now().toString());

    // Verify token was stored
    const storedToken = await StorageService.getItem("accessToken");
    console.log("Token stored successfully:", !!storedToken);
  },

  clearTokens: async (): Promise<void> => {
    await StorageService.removeItem("accessToken");
    await StorageService.removeItem("tokenTimestamp");
  },

  getAccessToken: async (): Promise<string | null> => {
    return await StorageService.getItem("accessToken");
  },

  // Helper to check if we have a token
  hasValidToken: async (): Promise<boolean> => {
    const token = await StorageService.getItem("accessToken");
    const timestamp = await StorageService.getItem("tokenTimestamp");

    if (!token || !timestamp) return false;

    // Check if token is expired (1 day = 24 hours)
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const tokenTime = parseInt(timestamp);
    const currentTime = Date.now();

    return currentTime - tokenTime <= oneDayInMs;
  },
};
