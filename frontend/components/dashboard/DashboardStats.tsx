import { format, subDays } from "date-fns";

import { fetchData } from "@/actions";
import DashboardStatsSummary from "@/components/dashboard-stats-summary";
import { SummariesApiResponse } from "@/lib/types";

interface DashboardStatsProps {
  searchParams: Record<string, any>;
}

export async function DashboardStats({ searchParams }: DashboardStatsProps) {
  const start =
    searchParams.start || format(subDays(new Date(), 6), "yyyy-MM-dd");
  const end = searchParams.end || format(new Date(), "yyyy-MM-dd");
  const url = `/v1/users/current/summaries?${new URLSearchParams({ start, end })}`;

  const durationData = await fetchData<SummariesApiResponse>(url, true);

  if (!durationData) {
    return (
      <div className="text-center text-red-500">
        Error fetching dashboard stats
      </div>
    );
  }

  return (
    <DashboardStatsSummary searchParams={searchParams} data={durationData} />
  );
}
