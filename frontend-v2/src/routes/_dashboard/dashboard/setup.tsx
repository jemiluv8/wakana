import { createFileRoute } from "@tanstack/react-router";

import HowItWorks from "~/components/hero/how-it-works";

export const Route = createFileRoute("/_dashboard/dashboard/setup")({
  component: RouteComponent,
});

function RouteComponent() {
  return <HowItWorks />;
}
