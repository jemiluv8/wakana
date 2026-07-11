import { createMiddleware } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../api";
import { User } from "~/types";

export const meQueryOptions = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: () =>
    apiFetch<{ user: User }>("/v1/auth/me"),
  staleTime: 1000 * 60 * 60, // 1 hour
});

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const cookieHeader = request.headers.get("cookie");

    const hasAuthCookie = cookieHeader
      ?.split(";")
      .some((cookie) => cookie.trim().startsWith("wakapi_auth="));

    if (!hasAuthCookie) {
      throw redirect({
        to: "/auth/login",
      });
    }

    return next()
  },
);