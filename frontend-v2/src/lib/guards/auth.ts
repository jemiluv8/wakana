import { queryOptions } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server"
import { createMiddleware, createServerFn } from "@tanstack/react-start";

import { User } from "~/types";

import { apiFetch } from "../api";

export const meQueryOptions = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: () => apiFetch<{ user: User }>("/v1/auth/me"),
  staleTime: 1000 * 60 * 60, // 1 hour
});

function hasCookie(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return false;

  const hasAuthCookie = cookieHeader
    ?.split(";")
    .some((cookie) => cookie.trim().startsWith("wakapi_auth="));

  console.log("hasAuthCookie", hasAuthCookie);

  return hasAuthCookie;
}

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    if (!hasCookie(request)) {
      throw redirect({
        to: "/auth/login",
      });
    }

    return next();
  }
);

export const isAuthenticated = createMiddleware().server(
  async ({ next, request }) => {
    const authenticated = hasCookie(request);
    return next({ context: { auth: { authenticated } } });
  }
);

export const getAuthState = createServerFn({
  method: "GET",
}).handler(async () => {
  const request = getRequest();

  return {
    authenticated: hasCookie(request),
  };
});
