import DashboardStatsSummary from "@/components/dashboard-stats-summary";
import { SummariesApiResponse } from "@/lib/types";

interface DashboardStatsProps {
  searchParams: Record<string, any>;
  data: SummariesApiResponse;
}

export async function DashboardStats({
  searchParams,
  data,
}: DashboardStatsProps) {
  return <DashboardStatsSummary searchParams={searchParams} data={data} />;
}
