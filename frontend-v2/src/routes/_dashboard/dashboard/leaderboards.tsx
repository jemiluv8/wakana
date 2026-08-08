import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { z } from "zod";

import { LeaderBoardTable } from "~/components/custom/leaderboard";
import { Spinner } from "~/components/custom/spinner/spinner";
import { apiFetch } from "~/lib/api";
import { useAuth } from "~/lib/providers/auth-provider";
import type { LeaderboardApiResponse } from "~/types";

const searchSchema = z.object({
  language: z.string().optional(),
});

export const Route = createFileRoute("/_dashboard/dashboard/leaderboards")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Leaderboards" },
    ],
  }),
  component: LeaderboardsPage,
});

function LeaderboardsPage() {
  const { hydrated, token, user } = useAuth();
  const { language } = useSearch({
    from: "/_dashboard/dashboard/leaderboards",
  });
  const query = useQuery({
    queryKey: ["leaderboard", user?.id ?? null, language ?? null],
    queryFn: () => {
      const suffix = language ? `?language=${encodeURIComponent(language)}` : "";
      return apiFetch<LeaderboardApiResponse>(`/v1/leaders${suffix}`);
    },
    enabled: hydrated && Boolean(token && user),
  });

  if (!hydrated || query.isLoading) {
    return <Spinner />;
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-background/80 px-6 py-14 text-center shadow-sm">
        <h1 className="text-3xl font-semibold text-foreground">
          Unable to load leaderboard
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Try again in a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl py-8 sm:py-12">
      <LeaderBoardTable
        title="Public"
        data={query.data}
        searchParams={{ language }}
      />
    </div>
  );
}
