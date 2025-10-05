import { useInfiniteQuery } from "@tanstack/react-query";
import { ApiError, EventsResponse } from "../type";
import { scanApi } from "../apiService";

export const useEvents = (pageSize: number = 20) => {
  return useInfiniteQuery<EventsResponse, ApiError>({
    queryKey: ["events", pageSize],
    queryFn: ({ pageParam = 1 }) => {
      console.log("Fetching page:", pageParam);
      return scanApi.getEvents(pageParam as number, pageSize);
    },
    getNextPageParam: (lastPage, allPages) => {
      console.log("Calculating next page param:", {
        lastPage: lastPage.page,
        total: lastPage.total,
        pageSize: lastPage.pageSize,
        totalPages: Math.ceil(lastPage.total / lastPage.pageSize),
      });

      const nextPage = lastPage.page + 1;
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);

      const shouldFetchNext = nextPage <= totalPages;
      console.log("Should fetch next page?", shouldFetchNext);

      return shouldFetchNext ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
};
