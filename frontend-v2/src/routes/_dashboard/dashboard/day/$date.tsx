import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import TimeTrackingVisualization from "~/components/day-dashboard/day";
import { Spinner } from "~/components/custom/spinner/spinner";
import { apiFetch } from "~/lib/api";
import { useAuth } from "~/lib/providers/auth-provider";
import type { DurationData } from "~/types";

export const Route = createFileRoute("/_dashboard/dashboard/day/$date")({
  component: DayPage,
});

function DayPage() {
  const { date } = Route.useParams();
  const { hydrated, token, user } = useAuth();

  const query = useQuery({
    queryKey: ["day", user?.id ?? null, date],
    queryFn: () =>
      apiFetch<DurationData>(
        `/v1/users/current/durations?${new URLSearchParams({ date })}`
      ),
    enabled: hydrated && Boolean(token && user),
  });

  if (!hydrated || query.isLoading) {
    return <Spinner />;
  }

  if (query.isError || !query.data) {
    return (
      <h3 className="text-center text-red-500">
        Error fetching dashboard stats
      </h3>
    );
  }

  return <TimeTrackingVisualization data={query.data} />;
}
