import { format, subDays } from "date-fns";

import { fetchData } from "@/actions";
import { ActivityCategoriesChart } from "@/components/charts/ActivityCategoriesChart";
import { WBarChart } from "@/components/charts/WBarChart";
import { WeekdaysBarChart } from "@/components/charts/WeekdaysBarChart";
import { SummariesApiResponse } from "@/lib/types";
import { makePieChartDataFromRawApiResponse } from "@/lib/utils";

interface DashboardChartsProps {
  searchParams: Record<string, any>;
}

export async function DashboardCharts({ searchParams }: DashboardChartsProps) {
  const start =
    searchParams.start || format(subDays(new Date(), 6), "yyyy-MM-dd");
  const end = searchParams.end || format(new Date(), "yyyy-MM-dd");
  const url = `/v1/users/current/summaries?${new URLSearchParams({ start, end })}`;

  let durationData: SummariesApiResponse | null = null;

  try {
    durationData = await fetchData<SummariesApiResponse>(url, true);
  } catch (error) {
    console.error("Failed to fetch dashboard chart data:", error);
    return (
      <div className="text-center text-red-500">
        Error fetching chart data:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
        <br />
        <small>URL: {url}</small>
      </div>
    );
  }

  if (!durationData) {
    return (
      <div className="text-center text-red-500">No chart data available</div>
    );
  }

  return (
    <div className="my-5 space-y-5">
      <div className="charts-grid">
        <div className="chart-box">
          <WBarChart
            innerRadius={34.45}
            title="EDITORS"
            colorNamespace="editors"
            defaultOrientation="vertical"
            data={makePieChartDataFromRawApiResponse(
              durationData.data,
              "editors"
            )}
            durationSubtitle="Editors used over the "
          />
        </div>
        <div className="chart-box">
          <WBarChart
            innerRadius={34.45}
            title="LANGUAGES"
            data={makePieChartDataFromRawApiResponse(
              durationData.data,
              "languages"
            )}
            defaultOrientation="vertical"
            colorNamespace="languages"
            durationSubtitle="Languages used over the "
          />
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-box">
          <WBarChart
            title="OPERATING SYSTEMS"
            data={makePieChartDataFromRawApiResponse(
              durationData.data,
              "operating_systems"
            )}
            defaultOrientation="horizontal"
            colorNamespace="operating_systems"
            durationSubtitle="Operating Systems used over the "
          />
        </div>
        <div className="chart-box">
          <WBarChart
            title="MACHINES"
            data={makePieChartDataFromRawApiResponse(
              durationData.data,
              "machines"
            )}
            defaultOrientation="horizontal"
            colorNamespace="machines"
            durationSubtitle="Machines used over the "
          />
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-box">
          <ActivityCategoriesChart data={durationData.data} />
        </div>
        <div className="chart-box">
          <WeekdaysBarChart data={durationData.data} />
        </div>
      </div>
    </div>
  );
}
