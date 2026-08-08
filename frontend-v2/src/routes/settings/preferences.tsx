import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Spinner } from "~/components/custom/spinner/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { UserPreferences } from "~/components/settings/user-preferences";
import { apiFetch } from "~/lib/api";
import { useAuth } from "~/lib/providers/auth-provider";
import type { UserProfile } from "~/types";

export const Route = createFileRoute("/settings/preferences")({
  component: RouteComponent,
});

function RouteComponent() {
  const { hydrated } = useAuth();
  const { data: user, isLoading } = useQuery({
    queryKey: ["settings", "profile"],
    queryFn: () => apiFetch<UserProfile>("/v1/profile"),
    staleTime: 10 * 60 * 1000,
    enabled: hydrated,
  });

  if (!hydrated || isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Preferences</CardTitle>
        <CardDescription>Edit your account preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <UserPreferences user={user} />
      </CardContent>
    </Card>
  );
}
