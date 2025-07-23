import { fetchData } from "@/actions";
import { DailyCodingSummaryOverTime } from "@/components/charts/DailyCodingSummaryOverTime";
import { WGaugeChart } from "@/components/charts/WGaugeChart";
import DeveloperActivityChart from "@/components/developer-activity-chart-v2";
import { ChartBox } from "@/components/layout/ChartBox";
import { SummariesApiResponse } from "@/lib/types";
import { format, subDays } from "date-fns";

interface DashboardTopChartsProps {
  searchParams: Record<string, any>;
}

export async function DashboardTopCharts({
  searchParams,
}: DashboardTopChartsProps) {
  const start =
    searchParams.start || format(subDays(new Date(), 6), "yyyy-MM-dd");
  const end = searchParams.end || format(new Date(), "yyyy-MM-dd");
  const url = `/v1/users/current/summaries?${new URLSearchParams({ start, end })}`;

  const durationData = await fetchData<SummariesApiResponse>(url, true);

  if (!durationData) {
    return (
      <div className="text-center text-red-500">Error fetching chart data</div>
    );
  }

  return (
    <section className="charts-grid-top">
      <div className="chart-box min-h-52">
        <DailyCodingSummaryOverTime data={durationData.data} />
      </div>
      <div className="chart-box min-h-52">
        <DeveloperActivityChart
          writePercentage={durationData.write_percentage}
          totalSeconds={+durationData.cumulative_total.seconds}
        />
      </div>
      <div className="chart-box min-h-52">
        <WGaugeChart
          data={durationData.data}
          dailyAverage={durationData.daily_average}
        />
      </div>
    </section>
  );
}
