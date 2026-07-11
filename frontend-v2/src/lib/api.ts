// hooks/useApiMutation.ts

import { VITE_PUBLIC_API_URL } from "~/config"
import { ApiError } from "~/types"


export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const full_url = `${VITE_PUBLIC_API_URL}${url}`
  const response = await fetch(full_url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  })

  const contentType = response.headers.get("content-type")
  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    throw new ApiError(
      typeof data === "object" && data !== null && "message" in data
        ? String(data.message)
        : "Something went wrong",
      response.status,
      data
    )
  }

  return data as T
}