import { queryOptions, useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { apiFetch } from "~/lib/api";
import { ApiError } from "~/types";

export const genericQueryOptions = <T>(url: string, otherOptions: Record<string, any> = {}) =>
  queryOptions({
    queryKey: [url],
    queryFn: () => apiFetch<T>(url),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    ...(otherOptions || {})
  });

export function useApiQuery<T>(
  url: string,
  options?: Omit<UseQueryOptions<T, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery<T, ApiError>({
    queryKey: [url],
    queryFn: () => apiFetch<T>(url),
    ...options,
  });
}
