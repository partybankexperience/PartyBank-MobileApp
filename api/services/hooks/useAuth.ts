import { useToast } from "@/shared/toast/ToastContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ApiError,
  LoginRequest,
  LoginResponse,
  ResetPasswordInitiateRequest,
  ResetPasswordInitiateResponse,
  ResetPasswordSubmitRequest,
  ResetPasswordSubmitResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "../type";
import { authApi, tokenService } from "../apiService";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      // Extract the accessToken from the response
      const { accessToken } = data;

      if (!accessToken) {
        throw new Error("No access token received");
      }

      // Store the token and timestamp
      await tokenService.setTokens(accessToken);

      // Verify token was stored
      const storedToken = await tokenService.getAccessToken();

      // Show success toast
      showToast("Login successful!", "success");

      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ["user"] });

      // Navigate to main app after a brief delay
      setTimeout(() => {
        router.replace("/(mainapp)/(tabs)");
      }, 1500);
    },
    onError: (error: any) => {
      console.error("Login error details:", error);

      // Extract the actual error message from the response
      let errorMessage = "Login failed";

      if (error.response?.data?.message) {
        // If the error has a response with message
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // If it's a general error message
        errorMessage = error.message;
      } else if (typeof error === "string") {
        // If error is a string
        errorMessage = error;
      }

      console.error("Login error message:", errorMessage);

      // Show error toast with the actual message from API
      showToast(errorMessage, "error");
    },
  });
};

export const useResetPasswordInitiate = () => {
  const { showToast } = useToast();

  return useMutation<
    ResetPasswordInitiateResponse,
    ApiError,
    ResetPasswordInitiateRequest
  >({
    mutationFn: ({ email }) => authApi.resetPasswordInitiate(email),
    onSuccess: (data) => {
      showToast(
        data.message || "Password reset instructions sent to your email",
        "success"
      );
    },
    onError: (error: any) => {
      // Extract the actual error message from the response
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send reset instructions";

      showToast(errorMessage, "error");
    },
  });
};

export const useVerifyOtp = () => {
  const { showToast } = useToast();

  return useMutation<VerifyOtpResponse, ApiError, VerifyOtpRequest>({
    mutationFn: authApi.verifyOtp,
    onSuccess: (data) => {
      showToast(data.message || "OTP verified successfully", "success");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to verify OTP";

      showToast(errorMessage, "error");
    },
  });
};

export const useResetPasswordSubmit = () => {
  const { showToast } = useToast();

  return useMutation<
    ResetPasswordSubmitResponse,
    ApiError,
    ResetPasswordSubmitRequest
  >({
    mutationFn: authApi.resetPasswordSubmit,
    onSuccess: (data) => {
      showToast(data.message || "Password reset successfully", "success");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to reset password";

      showToast(errorMessage, "error");
    },
  });
};

// Add a hook to check authentication status
export const useAuth = () => {
  const checkAuth = async (): Promise<boolean> => {
    return await tokenService.hasValidToken();
  };

  const getToken = async (): Promise<string | null> => {
    return await tokenService.getAccessToken();
  };

  const logout = async (): Promise<void> => {
    await tokenService.clearTokens();
    router.replace("/login");
  };

  return {
    checkAuth,
    getToken,
    logout,
  };
};
