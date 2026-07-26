import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { ProjectsApiResponse, ProjectsTable } from "~/components/custom/projects/projects-table";
import { ProjectsSkeleton } from "~/components/custom/section-skeleton/section-skeleton";
import { apiFetch } from "~/lib/api";

export const Route = createFileRoute("/_dashboard/projects")({
  component: RouteComponent,
  pendingComponent: ProjectsSkeleton,
});

const summariesQueryOptions = (url: string) =>
  queryOptions({
    queryKey: [url],
    queryFn: () => apiFetch<ProjectsApiResponse>(url),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

function RouteComponent() {
  const search = useSearch({ strict: false })
  const url = `/v1/users/current/projects?${search}`
  const { data } = useSuspenseQuery(summariesQueryOptions(url));
  const projects: any[] = data?.data || []
  console.log('data', data, projects)
  return (
    <div className="my-6">
      <div className="mb-5 flex items-center justify-start">
        <h1 className="text-4xl">Projects</h1>
      </div>
      <ProjectsTable projects={projects} />
    </div>
  );
}
