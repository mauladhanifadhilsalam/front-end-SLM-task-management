import { QueryClient } from "@tanstack/react-query";

const DEFAULT_STALE_TIME = 30 * 1000; // 30s
const DEFAULT_GC_TIME = 5 * 60 * 1000; // 5m

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_GC_TIME,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500 && status !== 429) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
