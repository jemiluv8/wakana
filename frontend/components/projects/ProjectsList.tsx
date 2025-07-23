import { fetchData } from "@/actions";
import { ProjectsApiResponse } from "@/components/projects-table";
import { ProjectsTable } from "@/components/projects-table";

interface ProjectsListProps {
  searchParams: Record<string, any>;
}

export async function ProjectsList({ searchParams }: ProjectsListProps) {
  const projects = await fetchData<ProjectsApiResponse | null>(
    `/v1/users/current/projects${new URLSearchParams(searchParams)}`
  );

  return <ProjectsTable projects={projects?.data || []} />;
}