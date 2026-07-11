import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { Spinner } from "~/components/custom/spinner/spinner";
import { authMiddleware, meQueryOptions } from "~/lib/guards/auth";
import { AuthProvider } from "~/lib/providers/auth-provider";

export const Route = createFileRoute("/_dashboard")({
  server: {
    middleware: [authMiddleware],
  },
  component: RootComponent,
});

export function RootComponent() {
  const {
    data: data,
    isLoading,
    isError,
  } = useQuery(meQueryOptions);

  if (isLoading) {
    return (<div>
      <Spinner />
    </div>);
  }

  if (isError || !data) {
    throw redirect({
      to: "/auth/login",
    });
  }

  return (
    <AuthProvider user={data.user}>
      <Outlet />
    </AuthProvider>
  );
}