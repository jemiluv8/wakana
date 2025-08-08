import { Suspense } from "react";

import { LeaderboardContent } from "@/components/leaderboard-content";
import { Spinner } from "@/components/spinner/spinner";

export default function Leaderboards({
  searchParams,
}: {
  searchParams: Record<string, any>;
}) {
  return (
    <Suspense fallback={<Spinner />}>
      <LeaderboardContent searchParams={searchParams} />
    </Suspense>
  );
}