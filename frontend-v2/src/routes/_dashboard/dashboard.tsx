import React, { Suspense } from "react";
import { useApiQuery } from "~/hooks/useApiQuery";
import { SummariesApiResponse } from "~/types";
import { DashboardStats } from "~/components/dashboard/DashboardStats";
import { DashboardTopCharts } from "~/components/dashboard/DashboardTopCharts";
import { DashboardCharts } from "~/components/dashboard/DashboardCharts";
import { DashboardProjects } from "~/components/dashboard/DashboardProjects";
import { format, subDays } from "date-fns";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { ChartsSkeleton, ProjectsSkeleton, StatsSkeleton, TopChartsSkeleton } from "~/components/custom/section-skeleton/section-skeleton";

export const Route = createFileRoute("/_dashboard/dashboard")({
  component: RouteComponent,
});


export default function RouteComponent() {
  const { start: rawStart, end: rawEnd } = useSearch({ strict: false }) as any;
  const searchParams = { start: rawStart, end: rawEnd }

  const url = React.useMemo(() => {
    const start = rawStart || format(subDays(new Date(), 6), "yyyy-MM-dd");
    const end = rawEnd || format(new Date(), "yyyy-MM-dd");

    return `/v1/users/current/summaries?${new URLSearchParams({
      start,
      end,
    })}`;
  }, []);

  const { data, isLoading, error } = useApiQuery<SummariesApiResponse>(url, {
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="my-6">
        <main className="main-dashboard space-y-5">
          <StatsSkeleton />
          <TopChartsSkeleton />
          <ChartsSkeleton />
          <ProjectsSkeleton />
        </main>
      </div>
    );
  }

  if (error || !data) {
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
          <DashboardStats searchParams={searchParams} data={data} />
        </Suspense>

        <Suspense fallback={<TopChartsSkeleton />}>
          <DashboardTopCharts searchParams={searchParams} data={data} />
        </Suspense>

        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardCharts searchParams={searchParams} data={data} />
        </Suspense>

        <Suspense fallback={<ProjectsSkeleton />}>
          <DashboardProjects searchParams={searchParams} data={data} />
        </Suspense>
      </main>
    </div>
  );
}
