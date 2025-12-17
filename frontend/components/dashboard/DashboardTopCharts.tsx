import { DailyCodingSummaryOverTime } from "@/components/charts/DailyCodingSummaryOverTime";
import { WGaugeChart } from "@/components/charts/WGaugeChart";
import DeveloperActivityChart from "@/components/developer-activity-chart-v2";
import { SummariesApiResponse } from "@/lib/types";

interface DashboardTopChartsProps {
  searchParams: Record<string, any>;
  data: SummariesApiResponse;
}

export async function DashboardTopCharts({
  searchParams,
  data,
}: DashboardTopChartsProps) {
  return (
    <section className="charts-grid-top">
      <div className="chart-box min-h-52">
        <DailyCodingSummaryOverTime data={data.data} />
      </div>
      <div className="chart-box min-h-52">
        <DeveloperActivityChart
          writePercentage={data.write_percentage}
          totalSeconds={+data.cumulative_total.seconds}
        />
      </div>
      <div className="chart-box min-h-52">
        <WGaugeChart
          data={data.data}
          dailyAverage={data.daily_average}
        />
      </div>
    </section>
  );
}
