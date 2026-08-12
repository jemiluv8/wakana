import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
  ProjectsApiResponse,
  ProjectsTable,
} from "~/components/custom/projects/projects-table";
import { Spinner } from "~/components/custom/spinner/spinner";
import { genericQueryOptions } from "~/hooks/useApiQuery";

export const Route = createFileRoute("/_dashboard/projects/")({
  component: RouteComponent,
  pendingComponent: Spinner,
});

function RouteComponent() {
  const search = useSearch({ strict: false }) as Record<string, string>;
  const url = `/v1/users/current/projects?${new URLSearchParams(search)}`;

  const { data } = useSuspenseQuery(genericQueryOptions<ProjectsApiResponse>(url));
  const projects: any[] = data?.data || []
  return (
    <div className="my-6">
      <div className="mb-5 flex items-center justify-start">
        <h1 className="text-4xl">Projects</h1>
      </div>
      <ProjectsTable projects={projects} />
    </div>
  );
}
