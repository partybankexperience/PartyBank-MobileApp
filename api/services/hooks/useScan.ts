import { useMutation } from "@tanstack/react-query";
import { ApiError, ScanVerifyRequest, ScanVerifyResponse } from "../type";
import { scanApi } from "../apiService";

export const useScanVerify = () => {
  return useMutation<ScanVerifyResponse, ApiError, ScanVerifyRequest>({
    mutationFn: scanApi.verifyScan,
  });
};
