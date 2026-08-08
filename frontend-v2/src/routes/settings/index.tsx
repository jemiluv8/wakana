import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Spinner } from "~/components/custom/spinner/spinner";
import { ApiKeyCopier } from "~/components/settings/api-key-copier";
import { KeystrokeTimeout } from "~/components/settings/keystroke-timeout";
import { WakatimeIntegration } from "~/components/settings/wakatime-integration";
import { apiFetch } from "~/lib/api";
import { useAuth } from "~/lib/providers/auth-provider";
import type { UserProfile } from "~/types";

export const Route = createFileRoute("/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { hydrated, user } = useAuth();
  const integrationStatus = user?.has_wakatime_integration
    ? "Connected"
    : "Not connected";

  const { data: profile, isLoading } = useQuery({
    queryKey: ["settings", "profile"],
    queryFn: () => apiFetch<UserProfile>("/v1/profile"),
    staleTime: 10 * 60 * 1000,
    enabled: hydrated,
  });

  if (!hydrated || isLoading || !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Api Key</CardTitle>
          <CardDescription>
            Used by the editor plugin to authenticate heartbeats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeyCopier />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wakatime Integration - Api Key</CardTitle>
          <CardDescription>
            Add your WakaTime api key to relay heartbeats to your WakaTime account.
          </CardDescription>
          <p className="text-sm text-muted-foreground">
            Current status: <span className="font-medium text-foreground">{integrationStatus}</span>
          </p>
        </CardHeader>
        <CardContent>
          <WakatimeIntegration />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keystroke Timeout</CardTitle>
          <CardDescription>
            Controls how heartbeats are grouped when computing coding time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KeystrokeTimeout initialValue={profile?.heartbeats_timeout_sec} />
        </CardContent>
      </Card>
    </div>
  );
}
