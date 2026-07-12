import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { apiFetch } from "~/lib/api";
import { ApiError } from "~/types";

type ApiMutationVariables = {
  body?: unknown;
  params?: RequestInit;
};

export function useApiMutation<TResponse>(
  url: string,
  options?: Omit<
    UseMutationOptions<TResponse, ApiError, ApiMutationVariables>,
    "mutationFn"
  >
) {
  return useMutation<TResponse, ApiError, ApiMutationVariables>({
    mutationFn: ({ body, params }) =>
      apiFetch<TResponse>(url, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
        ...params,
      }),

    ...options,
  });
}
