import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { ClientsList } from "~/components/clients/ClientsList";
import { Spinner } from "~/components/custom/spinner/spinner";

export const Route = createFileRoute("/_dashboard/dashboard/clients")({
  head: () => ({
    meta: [
      { title: "Clients" },
      { name: "description", content: "Wakana clients, manage your freelance clients." },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  return (
    <div className="my-6">
      <div className="mb-5 flex items-center justify-start">
        <h1 className="text-4xl">Clients</h1>
      </div>
      <Suspense fallback={<Spinner />}>
        <ClientsList />
      </Suspense>
    </div>
  );
}
