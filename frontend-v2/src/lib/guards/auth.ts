import { createMiddleware } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";

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

    // inject authcontext here
    return next();
  },
);