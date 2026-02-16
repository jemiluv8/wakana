import { ApiClient } from "@/actions/api";
import { LeaderBoardTable } from "@/components/leaderboard-table";
import { LeaderboardApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Leaderboards({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolvedParams = await searchParams;
  const queryParams = new URLSearchParams(resolvedParams);
  const url = `/v1/leaders?${queryParams.toString()}`;
  const durationData = await ApiClient.GET<LeaderboardApiResponse>(url, {
    skipAuth: true,
    // headers: {
    //   "Cache-Control": "max-age=3600",
    // },
    // next: {
    //   revalidate: 3600,
    // },
  });

  if (!durationData.success) {
    return <div>There was an error fetching leaderboard data...</div>;
  }

  // console.log("durationData", durationData);
  return (
    <div className="mt-5 min-h-screen">
      <LeaderBoardTable
        data={durationData.data}
        title="Public"
        searchParams={resolvedParams}
      />
    </div>
  );
}
