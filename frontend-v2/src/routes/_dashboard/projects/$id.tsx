import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import startCase from "lodash/startCase";
import { ActivityCategoriesChart } from "~/components/charts/ActivityCategoriesChart";
import { DailyCodingSummaryLineChart } from "~/components/charts/DailyCodingSummaryLineChart";
import { WBarChart } from "~/components/charts/WBarChart";
import { DashboardPeriodSelector } from "~/components/custom/dashboard-period-selector";
import FileActivityTreemapVisx from "~/components/custom/projects/file-activity-tree-map";
import { ProjectFiles } from "~/components/custom/projects/project-files";
import { VITE_PUBLIC_API_URL } from "~/config";
import { genericQueryOptions } from "~/hooks/useApiQuery";
import { useAuth } from "~/lib/providers/auth-provider";
import { makePieChartDataFromRawApiResponse } from "~/lib/utils";
import { SummariesApiResponse } from "~/types";

export const Route = createFileRoute("/_dashboard/projects/$id")({
  component: RouteComponent,
});

const prepareEntitiesData = (data: any[], field: string) => {
  return data.reduce((prev: any[], curr) => [...prev, ...curr[field]], []);
};

function RouteComponent() {
  const { user, token } = useAuth();
  const { id } = Route.useParams();
  const search = useSearch({ strict: false }) as any;
  const {
    start = format(subDays(new Date(), 7), "yyyy-MM-dd"),
    end = format(new Date(), "yyyy-MM-dd"),
  } = search;

  const url = `/v1/users/current/summaries?${new URLSearchParams({
    start,
    end,
    project: id,
  })}`;

  const { data: durationData } = useSuspenseQuery(
    genericQueryOptions<SummariesApiResponse>(url),
  );
  return (
    <main>
      <div className="flex items-center justify-between align-middle mb-4">
        <h1 className="text-3xl font-bold">{startCase(id)}</h1>
        <div>
          {user && token ? (
            <img
              className="with-url-src"
              src={`${VITE_PUBLIC_API_URL}/badge/${user.id}/project:${id}/interval:all_time?label=total&token=${encodeURIComponent(token)}`}
              alt="Badge"
              width={150}
              height={20}
            />
          ) : null}
        </div>
      </div>
      <div className="m-0 mb-5 mt-2 text-lg">
        <b>{durationData.cumulative_total.text}</b> <span>over the last</span>{" "}
        <DashboardPeriodSelector
          searchParams={search}
          baseUrl={`/projects/${id}`}
        />{" "}
        <span>in {id}</span>
      </div>
      <section className="charts-grid">
        <div className="min-h-52">
          <DailyCodingSummaryLineChart data={durationData.data} />
        </div>
        <div className="min-h-52">
          <ActivityCategoriesChart data={durationData.data} />
        </div>
      </section>
      <section className="charts-grid">
        <div>
          <WBarChart
            title="Languages"
            data={makePieChartDataFromRawApiResponse(
              durationData.data,
              "languages",
            )}
            colorNamespace="languages"
            durationSubtitle="Languages used over the "
          />
        </div>
        <div>
          <WBarChart
            title="Editors"
            data={makePieChartDataFromRawApiResponse(
              durationData.data,
              "editors",
            )}
            colorNamespace="editors"
            durationSubtitle="Editors used over the "
          />
        </div>
      </section>
      <FileActivityTreemapVisx
        rawData={prepareEntitiesData(durationData.data, "entities")}
      />
      <div className="mt-12 flex justify-center gap-5">
        <div className="flex justify-between gap-40">
          <ProjectFiles
            data={durationData.data}
            field="entities"
            title="Files"
            showCopy={true}
          />
          <ProjectFiles
            data={durationData.data}
            field="branches"
            title="Branches"
          />
        </div>
      </div>
    </main>
  );
}
