import { Suspense } from "react";

import { LeaderboardContent } from "@/components/leaderboard-content";
import { Spinner } from "@/components/spinner/spinner";

export const metadata = {
  title: "Leaderboards | Wakana",
  description: "See how you rank among developers worldwide. Compare coding time, languages, and productivity metrics.",
};

export default function LeaderboardsPage({
  searchParams,
}: {
  searchParams: Record<string, any>;
}) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Suspense fallback={
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      }>
        <LeaderboardContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}