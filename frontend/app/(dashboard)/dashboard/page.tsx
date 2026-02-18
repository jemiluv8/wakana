import { format, subDays } from "date-fns";
import { Metadata } from "next";
import { Suspense } from "react";

import { fetchData } from "@/actions";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardProjects } from "@/components/dashboard/DashboardProjects";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardTopCharts } from "@/components/dashboard/DashboardTopCharts";
import {
  ChartsSkeleton,
  ProjectsSkeleton,
  StatsSkeleton,
  TopChartsSkeleton,
} from "@/components/ui/SectionSkeleton";
import { SummariesApiResponse } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Wakana main dashboard for analytics.",
};

export const revalidate = 300;

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, any>>;
}) {
  const params = await searchParams;
  const start = params.start || format(subDays(new Date(), 6), "yyyy-MM-dd");
  const end = params.end || format(new Date(), "yyyy-MM-dd");
  const url = `/v1/users/current/summaries?${new URLSearchParams({ start, end })}`;

  const durationData = await fetchData<SummariesApiResponse>(url, true);

  if (!durationData) {
    return (
      <div className="text-center text-red-500">
        Error fetching dashboard data
      </div>
    );
  }

  return (
    <div className="my-6">
      <main className="main-dashboard space-y-5">
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats searchParams={params} data={durationData} />
        </Suspense>

        <Suspense fallback={<TopChartsSkeleton />}>
          <DashboardTopCharts searchParams={params} data={durationData} />
        </Suspense>

        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardCharts searchParams={params} data={durationData} />
        </Suspense>

        <Suspense fallback={<ProjectsSkeleton />}>
          <DashboardProjects searchParams={params} data={durationData} />
        </Suspense>
      </main>
    </div>
  );
}
