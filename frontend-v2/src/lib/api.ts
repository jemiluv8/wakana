import { VITE_PUBLIC_API_URL } from "~/config";

export async function apiFetch<T>(url: string): Promise<T> {
  if (!VITE_PUBLIC_API_URL) {
    throw new Error("VITE_PUBLIC_API_URL is not configured")
  }

  const response = await fetch(`${VITE_PUBLIC_API_URL}${url}`, {
    credentials: "include",
  })

  if (!response.ok) {
    const error = (await response.json()) as ApiError
    throw error
  }

  return response.json() as Promise<T>
}

export interface ApiError {
  message: string
  code: string
  status: number
}