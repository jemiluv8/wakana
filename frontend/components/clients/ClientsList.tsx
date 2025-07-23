import { fetchData } from "@/actions";
import { ClientsApiResponse, ClientsTable } from "@/components/clients-table";
import { Project } from "@/components/projects-table";

export async function ClientsList() {
  const clients = await fetchData<ClientsApiResponse | null>(
    "/v1/users/current/clients"
  );
  const projects = await fetchData<{ data: Project[] } | null>(
    "/v1/users/current/projects"
  );

  return (
    <ClientsTable
      clients={clients?.data || []}
      projects={projects?.data || []}
    />
  );
}