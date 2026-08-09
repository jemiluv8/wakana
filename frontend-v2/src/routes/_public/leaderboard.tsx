import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { LeaderBoardTableV2 } from "~/components/custom/leaderboard";
import { Spinner } from "~/components/custom/spinner/spinner";
import { apiFetch } from "~/lib/api";
import { LeaderboardApiResponse } from "~/types";

const productSearchSchema = z.object({
  language: z.string().optional(),
});

export const Route = createFileRoute("/_public/leaderboard")({
  head: () => ({
    meta: [
      {
        title: "Leaderboards | Wakana",
      },
      {
        name: "description",
        content:
          "See how you rank among developers worldwide. Compare coding time, languages, and productivity metrics.",
      },
    ],
  }),
  validateSearch: productSearchSchema,
  component: RouteComponent,
  pendingComponent: () => (
    <div>
      <Spinner />
      Loading leaderboard...
    </div>
  ),
  loaderDeps: ({ search: { language } }) => ({ language }),
  loader: async ({ context, deps: { language } }) => {
    const query = language ? `?language=${encodeURIComponent(language)}` : "";

    return await context.queryClient.ensureQueryData({
      queryKey: ["/v1/leaders", language],
      queryFn: () => apiFetch<LeaderboardApiResponse>(`/v1/leaders${query}`),
    });
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();

  return (
    <div className="mx-auto w-full max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <LeaderBoardTableV2 title="Top Coders" data={data} searchParams={search} />
    </div>
  );
}
