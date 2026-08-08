import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock3, Loader2, Monitor, TriangleAlert } from "lucide-react";

import { PluginStatusSkeleton } from "~/components/custom/section-skeleton/section-skeleton";
import { apiFetch } from "~/lib/api";
import { useAuth } from "~/lib/providers/auth-provider";
import { cn } from "~/lib/utils";

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

export const Route = createFileRoute("/_public/plugins/status")({
  head: () => ({
    meta: [
      {
        title: "Plugin Status | Wakana",
      },
      {
        name: "description",
        content:
          "Review the latest plugin activity reported by your connected editors and clients.",
      },
    ],
  }),
  component: PluginStatusPage,
});

function formatLastSeen(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function PluginStatusPage() {
  const { hydrated, token, user } = useAuth();
  const query = useQuery({
    queryKey: ["plugin-status", user?.id ?? null],
    queryFn: () => apiFetch<PluginStatusResponse>("/v1/users/current/user-agents"),
    enabled: hydrated && Boolean(token && user),
  });

  if (!hydrated || query.isLoading) {
    return <PluginStatusSkeleton />;
  }

  if (!token || !user) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center rounded-3xl border border-border bg-background/80 px-6 py-14 text-center shadow-sm">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <TriangleAlert className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground">
          Sign in to view plugin status
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Plugin health is tied to your account, so you need to be signed in
          before we can show the latest activity from your editors and
          integrations.
        </p>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center rounded-3xl border border-border bg-background/80 px-6 py-14 text-center shadow-sm">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground">
          Unable to load plugin status
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Try again in a moment. If the problem keeps happening, the backend may
          be unavailable or your session token may need to be refreshed.
        </p>
      </div>
    );
  }

  const agents = query.data?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl py-8 sm:py-12 lg:py-16">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
          Plugin Status
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Your tracked editors and clients.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
          This page shows the most recent plugin activity reported for your
          account. If a client stops showing up here, it is usually a sign that
          the plugin stopped sending heartbeats.
        </p>
      </div>

      {agents.length === 0 ? (
        <div className="rounded-3xl border border-border bg-background/80 px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Monitor className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            No plugin activity yet
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            We have not received any plugin activity for this account yet.
            Check your plugin configuration, generate a little coding activity,
            and come back once a client has had time to report in.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <article
              key={agent.id}
              className={cn(
                "rounded-2xl border border-border bg-background/85 p-5 shadow-sm transition-transform",
                "hover:-translate-y-0.5 hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-foreground">
                      {agent.editor}
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      Up
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {agent.os}
                  </p>
                </div>
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Last seen</dt>
                  <dd className="text-right font-medium text-foreground">
                    {formatLastSeen(agent.last_seen_at)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Version</dt>
                  <dd className="text-right font-medium text-foreground">
                    {agent.version}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">CLI</dt>
                  <dd className="text-right font-medium text-foreground">
                    {agent.cli_version}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                {agent.is_browser_extension ? (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    Browser extension
                  </span>
                ) : null}
                {agent.is_desktop_app ? (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    Desktop app
                  </span>
                ) : null}
                {agent.go_version ? (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    Go {agent.go_version}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                <span className="truncate">{agent.value}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
