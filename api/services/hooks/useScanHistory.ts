// Create a new file: @/api/services/hooks/useScanHistory.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { scanApi } from "../apiService";
import { ApiError, ScanHistoryResponse } from "../type";

export const useScanHistory = (eventId: string | null) => {
  return useInfiniteQuery<ScanHistoryResponse>({
    queryKey: ["scanHistory", eventId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await scanApi.getScanHistory(
        pageParam as number,
        10,
        eventId,
      );
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      if (allPages.length < totalPages) {
        return allPages.length + 1;
      }
      return undefined;
    },
    enabled: true, // Always enabled
    initialPageParam: 1,
  });
};