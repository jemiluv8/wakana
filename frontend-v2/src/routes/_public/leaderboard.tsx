import { createFileRoute } from '@tanstack/react-router'
import { LeaderBoardTable } from '~/components/custom/leaderboard';
import { Spinner } from '~/components/custom/spinner/spinner';
import { LeaderboardApiResponse } from '~/types';
import { apiFetch } from '~/lib/api';
import { z } from "zod"

const productSearchSchema = z.object({
  language: z.string().optional()
})


export const Route = createFileRoute('/_public/leaderboard')({
  validateSearch: productSearchSchema,
  component: RouteComponent,
  pendingComponent: () => (
    <div>
      <Spinner />
      Loading leaderboard...
    </div>
  ),
  loaderDeps: ({ search: { language } }) => ({ language }),
  loader: async ({ context, deps: { language} }) => {
    const query = language
      ? `?language=${encodeURIComponent(language)}`
      : ''

    return await context.queryClient.ensureQueryData({
      queryKey: ["/v1/leaders", language],
      queryFn: () => apiFetch<LeaderboardApiResponse>(`/v1/leaders${query}`),
    })
  },
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return <LeaderBoardTable title='Leaderboard' data={data} />
}
