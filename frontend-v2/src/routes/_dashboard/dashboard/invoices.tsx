import { Suspense } from "react";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { InvoicesList } from "~/components/invoices/InvoicesList";
import { Spinner } from "~/components/custom/spinner/spinner";

export const Route = createFileRoute("/_dashboard/dashboard/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices" },
      { name: "description", content: "Wakana invoices, create and track invoices for billable hours." },
    ],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  if (pathname !== "/dashboard/invoices") {
    return <Outlet />;
  }

  return (
    <div className="my-6">
      <div className="mb-5 flex items-center justify-start">
        <h1 className="text-4xl">Invoices</h1>
      </div>
      <Suspense fallback={<Spinner />}>
        <InvoicesList />
      </Suspense>
    </div>
  );
}
