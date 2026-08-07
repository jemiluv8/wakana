import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { Spinner } from "~/components/custom/spinner/spinner";
import { DashboardLayout } from "~/components/layouts/dashboard-layout";
import { useAuth } from "~/lib/providers/auth-provider";

export const Route = createFileRoute("/_dashboard")({
  component: RootComponent,
});

export function RootComponent() {
  const { hydrated, isAuthenticated, user } = useAuth();

  if (!hydrated) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    throw redirect({
      to: "/auth/login",
    });
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
