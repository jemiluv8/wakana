import { useState, Suspense } from "react";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { InvoicesList } from "~/components/invoices/InvoicesList";
import { Spinner } from "~/components/custom/spinner/spinner";
import { Button } from "~/components/ui/button";

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
  const [createOpen, setCreateOpen] = useState(false);

  if (pathname !== "/dashboard/invoices") {
    return <Outlet />;
  }

  return (
    <div className="my-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="text-4xl">Invoices</h1>
        <Button type="button" className="gap-2 whitespace-nowrap" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Create Invoice
        </Button>
      </div>
      <Suspense fallback={<Spinner />}>
        <InvoicesList createOpen={createOpen} setCreateOpen={setCreateOpen} />
      </Suspense>
    </div>
  );
}
