import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "~/lib/providers/auth-provider";
import { Spinner } from "~/components/custom/spinner/spinner";
import { SettingsNavigation } from "~/components/settings/settings-navigation";
import { DashboardLayout } from "~/components/layouts/dashboard-layout";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { hydrated, isAuthenticated } = useAuth();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    throw redirect({
      to: "/auth/login",
    });
  }

  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <SettingsNavigation />
          <div className="grid gap-6">
            <Outlet />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
