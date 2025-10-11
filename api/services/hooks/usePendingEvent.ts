import { useInfiniteQuery } from "@tanstack/react-query";
import { ApiError, PendingEventsResponse } from "../type";
import { scanApi } from "../apiService";

export const usePendingEvents = (pageSize: number = 20) => {
  return useInfiniteQuery<PendingEventsResponse, ApiError>({
    queryKey: ["pendingevents", pageSize],
    queryFn: ({ pageParam = 1 }) => {
      return scanApi.getPendingEvents(pageParam as number, pageSize);
    },
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = lastPage.page + 1;
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);

      const shouldFetchNext = nextPage <= totalPages;

      return shouldFetchNext ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
};
