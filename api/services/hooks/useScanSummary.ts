// Create a new file: @/api/services/hooks/useScanSummary.ts
import { useQuery } from "@tanstack/react-query";
import { scanApi } from "../apiService";
import { ScanSummaryResponse } from "../type";

export const useScanSummary = (range: string) => {
  return useQuery<ScanSummaryResponse>({
    queryKey: ["scanSummary", range],
    queryFn: () => scanApi.getScanSummary(range),
    enabled: !!range,
  });
};
