import { fetchData } from "@/actions";
import GoalsManager from "@/components/goals-manager";
import { GoalData, Project } from "@/lib/types";

export async function GoalsList() {
  const goalData = await fetchData<{ data: GoalData[] }>(
    "/v1/users/current/goals"
  );
  if (!goalData) {
    return <p>Error fetching goals</p>;
  }

  const projects = await fetchData<{ data: Project[] }>(
    "/v1/users/current/projects"
  );

  const goals = goalData.data;

  return <GoalsManager goals={goals} projects={projects?.data || []} />;
}