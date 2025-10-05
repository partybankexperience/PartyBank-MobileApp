import { useToast } from "@/shared/toast/ToastContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { router } from "expo-router";
import { ApiError, LoginRequest, LoginResponse } from "../type";
import { authApi, tokenService } from "../apiService";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      console.log("Login response:", data);

      // Extract the accessToken from the response
      const { accessToken } = data;

      if (!accessToken) {
        throw new Error("No access token received");
      }

      // Store the token and timestamp
      await tokenService.setTokens(accessToken);

      // Verify token was stored
      const storedToken = await tokenService.getAccessToken();
      console.log("Token verification - stored:", !!storedToken);

      // Show success toast
      showToast("Login successful!", "success");

      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ["user"] });

      // Navigate to main app after a brief delay
      setTimeout(() => {
        router.replace("/(mainapp)/(tabs)");
      }, 1500);
    },
    onError: (error) => {
      console.error("Login error:", error);
      // Show error toast
      showToast(error.message || "Login failed", "error");
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
