import { fetchData } from "@/actions";
import {
  ProjectsApiResponse,
  ProjectsTable,
} from "@/components/projects-table";

export default async function Projects({
  searchParams,
}: Record<string, string>) {
  const projects = await fetchData<ProjectsApiResponse | null>(
    `compat/wakatime/v1/users/current/projects${new URLSearchParams(
      searchParams
    )}`
  );

  return (
    <div className="my-6">
      <div className="mb-5 flex items-center justify-start">
        <h1 className="text-4xl">Projects</h1>
      </div>
      <ProjectsTable projects={projects?.data || []} />
    </div>
  );
}
