import { Metadata } from "next";
import { Suspense } from "react";

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

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Wakana main dashboard for analytics.",
};

export default function Dashboard({
  searchParams,
}: {
  searchParams: Record<string, any>;
}) {
  return (
    <div className="my-6">
      <main className="main-dashboard space-y-5">
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats searchParams={searchParams} />
        </Suspense>

        <Suspense fallback={<TopChartsSkeleton />}>
          <DashboardTopCharts searchParams={searchParams} />
        </Suspense>

        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardCharts searchParams={searchParams} />
        </Suspense>

        <Suspense fallback={<ProjectsSkeleton />}>
          <DashboardProjects searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
