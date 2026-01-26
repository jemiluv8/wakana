import { ActivityCategoriesChart } from "@/components/charts/ActivityCategoriesChart";
import { WBarChart } from "@/components/charts/WBarChart";
import { WeekdaysBarChart } from "@/components/charts/WeekdaysBarChart";
import { SummariesApiResponse } from "@/lib/types";
import { makePieChartDataFromRawApiResponse } from "@/lib/utils";

interface DashboardChartsProps {
  searchParams: Record<string, any>;
  data: SummariesApiResponse;
}

export async function DashboardCharts({ data }: DashboardChartsProps) {
  return (
    <div className="my-5 space-y-5">
      <div className="charts-grid">
        <div className="chart-box">
          <WBarChart
            innerRadius={34.45}
            title="EDITORS"
            colorNamespace="editors"
            defaultOrientation="vertical"
            data={makePieChartDataFromRawApiResponse(data.data, "editors")}
            durationSubtitle="Editors used over the "
          />
        </div>
        <div className="chart-box">
          <WBarChart
            innerRadius={34.45}
            title="LANGUAGES"
            data={makePieChartDataFromRawApiResponse(data.data, "languages")}
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
              data.data,
              "operating_systems",
            )}
            defaultOrientation="horizontal"
            colorNamespace="operating_systems"
            durationSubtitle="Operating Systems used over the "
          />
        </div>
        <div className="chart-box">
          <WBarChart
            title="MACHINES"
            data={makePieChartDataFromRawApiResponse(data.data, "machines")}
            defaultOrientation="horizontal"
            colorNamespace="machines"
            durationSubtitle="Machines used over the "
          />
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-box">
          <ActivityCategoriesChart data={data.data} />
        </div>
        <div className="chart-box">
          <WeekdaysBarChart data={data.data} />
        </div>
      </div>
    </div>
  );
}
