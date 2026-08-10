import React, { Suspense, useMemo } from "react";
import { format, subDays } from "date-fns";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  useLocation,
  useSearch,
} from "@tanstack/react-router";

import { apiFetch } from "~/lib/api";
import { SummariesApiResponse } from "~/types";

import { Spinner } from "~/components/custom/spinner/spinner";
import { DashboardStats } from "~/components/dashboard/DashboardStats";
import { DashboardCharts } from "~/components/dashboard/DashboardCharts";
import { DashboardProjects } from "~/components/dashboard/DashboardProjects";
import { DashboardTopCharts } from "~/components/dashboard/dashboard-top-charts";
import {
  ChartsSkeleton,
  ProjectsSkeleton,
  StatsSkeleton,
  TopChartsSkeleton,
} from "~/components/custom/section-skeleton/section-skeleton";

const summariesQueryOptions = (url: string) =>
  queryOptions({
    queryKey: [url],
    queryFn: () => apiFetch<SummariesApiResponse>(url),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

export const Route = createFileRoute("/_dashboard/dashboard")({
  pendingComponent: Spinner,
  component: RouteComponent,
});

function RouteComponent() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  if (pathname !== "/dashboard") {
    return <Outlet />;
  }

  return <DashboardHome />;
}

function DashboardHome() {
  const { start: rawStart, end: rawEnd } = useSearch({
    strict: false,
  }) as any;

  const searchParams = {
    start: rawStart,
    end: rawEnd,
  };

  const url = useMemo(() => {
    const start =
      rawStart || format(subDays(new Date(), 6), "yyyy-MM-dd");
    const end = rawEnd || format(new Date(), "yyyy-MM-dd");

    return `/v1/users/current/summaries?${new URLSearchParams({
      start,
      end,
    })}`;
  }, [rawStart, rawEnd]);

  const { data } = useSuspenseQuery(summariesQueryOptions(url));

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
