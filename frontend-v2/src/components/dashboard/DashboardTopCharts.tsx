import DeveloperActivityChart from "../custom/developer-activity-chart-v2";

import { SummariesApiResponse } from "~/types";
import { WGaugeChart } from "../charts/WGaugeChart";
import { DailyCodingSummaryOverTime } from "../charts/DailyCodingSummaryOverTime";

interface DashboardTopChartsProps {
  searchParams: Record<string, any>;
  data: SummariesApiResponse;
}

export async function DashboardTopCharts({ data }: DashboardTopChartsProps) {
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
        <WGaugeChart data={data.data} dailyAverage={data.daily_average} />
      </div>
    </section>
  );
}
