import { StorageService } from "@/app/state/storageService";
import {
  AcceptInviteResponse,
  EventsResponse,
  EventSummary,
  LoginRequest,
  LoginResponse,
  PendingEventsResponse,
  ResetPasswordInitiateResponse,
  ResetPasswordSubmitRequest,
  ResetPasswordSubmitResponse,
  ScanVerifyRequest,
  ScanVerifyResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "./type";
import api from "../apiInstance";

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", credentials);

    const data = await response.data;
    console.log(data);

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

    if (!response.data) {
      throw new Error(data.message || "Failed to initiate password reset");
    }

    return data;
  },
  verifyOtp: async (request: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await api.post("/reset-password/verify", request);

    const data = await response.data;

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

  verifyScan: async (
    request: ScanVerifyRequest
  ): Promise<ScanVerifyResponse> => {
    const token = await tokenService.getAccessToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.post("/scan/verify", request);

    const data = await response.data;

    if (!response.data) {
      throw new Error(data.message || "Failed to verify scan");
    }

    return data;
  },

  getPendingEvents: async (
    page: number = 1,
    pageSize: number = 20
  ): Promise<PendingEventsResponse> => {
    const response = await api.get(
      `/invites/me/pending-invites?page=${page}&pageSize=${pageSize}`
    );

    const data = await response.data;

    if (!data) {
      throw new Error(data.message || "Failed to fetch events");
    }

    return data;
  },
};

export const inviteApi = {
  acceptInvite: async (inviteId: string): Promise<AcceptInviteResponse> => {
    const response = await api.post(`/invites/${inviteId}/accept`);

    const data = await response.data;

    if (!response.data) {
      throw new Error(data.message || "Failed to accept invite");
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
