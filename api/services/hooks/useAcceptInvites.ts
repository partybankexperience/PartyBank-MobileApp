import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/shared/toast/ToastContext";
import { AcceptInviteResponse, ApiError } from "../type";
import { inviteApi } from "../apiService";

export const useAcceptInvite = () => {
  const { showToast } = useToast();

  return useMutation<AcceptInviteResponse, ApiError, string>({
    mutationFn: (inviteId) => inviteApi.acceptInvite(inviteId),
    onSuccess: (data) => {
      showToast("Invite accepted successfully!", "success");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to accept invite";

      showToast(errorMessage, "error");
    },
  });
};
