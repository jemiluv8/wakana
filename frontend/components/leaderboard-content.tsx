import { fetchData } from "@/actions";
import { LeaderBoardTableV2 } from "@/components/leaderboard-table-v2";
import { LeaderboardApiResponse } from "@/lib/types";

interface LeaderboardContentProps {
  searchParams: Record<string, any>;
}

export async function LeaderboardContent({
  searchParams,
}: LeaderboardContentProps) {
  const queryParams = new URLSearchParams(searchParams);
  const url = `/v1/leaders?${queryParams.toString()}`;

  const durationData = await fetchData<LeaderboardApiResponse>(url, false);

  if (!durationData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        There was an error fetching leaderboard data...
      </div>
    );
  }

  return (
    <LeaderBoardTableV2
      data={durationData}
      title="Top Coders"
      titleClass=""
      searchParams={searchParams}
    />
  );
}
