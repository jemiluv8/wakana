import { createFileRoute } from '@tanstack/react-router'
import { LeaderBoardTable } from '~/components/custom/leaderboard';
import { Spinner } from '~/components/custom/spinner/spinner';
import { LeaderboardApiResponse } from '~/components/types';
import { apiFetch } from '~/lib/api';

export interface LeaderboardItem {
  name: string;
}

export const Route = createFileRoute('/_public/leaderboard')({
  component: RouteComponent,
  pendingComponent: () => (
    <div>
      <Spinner />
      Loading leaderboard...
    </div>
  ),
  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData({
      queryKey: ["/v1/leaders"],
      queryFn: () => apiFetch<LeaderboardApiResponse>("/v1/leaders"),
    })
  },
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return <LeaderBoardTable title='Leaderboard' data={data} />
}
