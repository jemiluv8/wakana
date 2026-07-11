// hooks/useApiQuery.ts

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { apiFetch } from "~/lib/api"
import { ApiError } from "~/types"

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