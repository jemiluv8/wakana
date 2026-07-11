// hooks/useApiQuery.ts

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { apiFetch, ApiError } from "~/lib/api"

export function useApiQuery<T>(
  url: string,
  options?: Omit<
    UseQueryOptions<T, ApiError>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<T, ApiError>({
    queryKey: [url],
    queryFn: () => apiFetch<T>(url),
    ...options,
  })
}