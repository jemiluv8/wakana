import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PluginStatusSkeleton } from "~/components/custom/section-skeleton/section-skeleton";
import { apiFetch } from "~/lib/api";
import { useAuth } from "~/lib/providers/auth-provider";
import { humanizeDate } from "~/lib/utils";

type PluginUserAgent = {
  id: string;
  value: string;
  editor: string;
  version: string;
  os: string;
  last_seen_at: string;
  is_browser_extension: boolean;
  is_desktop_app: boolean;
  created_at: string;
  cli_version: string;
  go_version: string;
};

type PluginStatusResponse = {
  data: PluginUserAgent[];
};

export const Route = createFileRoute("/_dashboard/dashboard/plugins/status")({
  head: () => ({
    meta: [
      {
        title: "Active Plugins",
      },
      {
        name: "description",
        content: "Wakana plugins, check plugins and their health.",
      },
    ],
  }),
  component: RouteComponent,
});

function PluginStatusCard({ agent }: { agent: PluginUserAgent }) {
  return (
    <div className="rounded-2xl border border-border bg-background px-5 py-5 shadow-sm transition-colors hover:bg-muted/40">
      <div className="flex flex-col justify-center gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-medium text-foreground">
            {agent.editor}
          </h2>
          <p className="text-sm text-muted-foreground">
            <b>Last Seen: </b>
            {humanizeDate(agent.last_seen_at)}
          </p>
          <p className="text-sm text-muted-foreground">
            <b>Version: </b>
            {agent.version} <span />
            with cli {agent.cli_version}
          </p>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-green-500">Up</h2>
        </div>
      </div>
    </div>
  );
}

function PluginStatusList() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["plugin-status", user?.id ?? null],
    queryFn: () => apiFetch<PluginStatusResponse>("/v1/users/current/user-agents"),
    enabled: Boolean(user),
  });

  if (query.isLoading) {
    return <PluginStatusSkeleton />;
  }

  if (query.isError || !query.data) {
    return <p>Error fetching </p>;
  }

  return (
    <div className="mx-auto mr-12 flex w-full flex-col justify-center gap-5">
      {query.data.data.map((agent) => (
        <PluginStatusCard agent={agent} key={agent.id} />
      ))}

      {query.data.data.length === 0 && (
        <p className="text-center text-lg">
          We have not received any plugin activity for your account. <br />{" "}
          Check your plugin setup to ensure it is working correctly, code a bit
          and come back to check again.
        </p>
      )}
    </div>
  );
}

function RouteComponent() {
  return (
    <div
      className="m-14 flex flex-col items-center justify-center md:px-32"
      style={{ minHeight: "60vh" }}
    >
      <h1 className="text-6xl">Plugin Status</h1>
      <p className="my-5 mb-12 text-lg">
        Your plugins and their health status.
      </p>

      <PluginStatusList />
    </div>
  );
}
