import { useQuery } from "@tanstack/react-query";
import { ApiError, EventSummary } from "../type";
import { scanApi } from "../apiService";

export const useEventSummary = (eventId: string) => {
  return useQuery<EventSummary, ApiError>({
    queryKey: ["eventSummary", eventId],
    queryFn: () => scanApi.getEventSummary(eventId),
    enabled: !!eventId, // Only fetch if eventId is provided
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
};
