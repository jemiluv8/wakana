import { createFileRoute, redirect } from "@tanstack/react-router";
import { authMiddleware } from "~/lib/guards/auth";

export const Route = createFileRoute("/_dashboard")({
  server: {
    middleware: [authMiddleware],
  },
  component: Dashboard,
});

function Dashboard() {
  return <div>Protected dashboard</div>;
}