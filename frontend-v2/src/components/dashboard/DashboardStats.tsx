// import DashboardStatsSummary from "@/components/dashboard-stats-summary";
// import { SummariesApiResponse } from "@/lib/types";

import { SummariesApiResponse } from "~/types";
import DashboardStatsSummary from "../custom/dashboard-stats-summary";

interface DashboardStatsProps {
  searchParams: Record<string, any>;
  data: SummariesApiResponse;
}

export function DashboardStats({
  searchParams,
  data,
}: DashboardStatsProps) {
  return <DashboardStatsSummary searchParams={searchParams} data={data} />;
}
