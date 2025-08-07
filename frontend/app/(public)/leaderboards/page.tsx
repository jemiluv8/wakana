import { ApiClient } from "@/actions/api";
import { LeaderBoardTableV2 } from "@/components/leaderboard-table-v2";
import { LeaderboardApiResponse } from "@/lib/types";

export default async function Leaderboards({
  searchParams,
}: {
  searchParams: Record<string, any>;
}) {
  const queryParams = new URLSearchParams(searchParams);
  const url = `/v1/leaders?${queryParams.toString()}`;
  const durationData = await ApiClient.GET<LeaderboardApiResponse>(url, {
    skipAuth: true,
    headers: {
      "Cache-Control": "max-age=3600",
    },
    cache: "default",
    next: {
      revalidate: 3600,
    },
  });

  if (!durationData.success) {
    return <div>There was an error fetching leaderboard data...</div>;
  }

  return (
    <LeaderBoardTableV2
      data={durationData.data}
      title="Top Coders"
      titleClass=""
      searchParams={searchParams}
    />
  );
}
