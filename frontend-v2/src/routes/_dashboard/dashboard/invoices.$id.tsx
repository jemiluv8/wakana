import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  ErrorComponent,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import { NotFound } from "~/components/NotFound";
import { Spinner } from "~/components/custom/spinner/spinner";
import { InvoiceManager } from "~/components/invoices/invoice-manager";
import { apiFetch } from "~/lib/api";
import { useAuth } from "~/lib/providers/auth-provider";
import { ApiError, type Invoice } from "~/types";

type InvoiceResponse = {
  data: Invoice;
};

export const Route = createFileRoute("/_dashboard/dashboard/invoices/$id")({
  component: InvoiceDetailPage,
});

function InvoiceDetailPage() {
  const { id } = Route.useParams();
  const { hydrated, token, user } = useAuth();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["invoice", user?.id ?? null, id],
    queryFn: () => apiFetch<InvoiceResponse>(`/v1/users/current/invoices/${id}`),
    enabled: hydrated && Boolean(token && user),
  });

  if (!hydrated || query.isLoading) {
    return <Spinner />;
  }

  if (query.error instanceof ApiError && query.error.status === 404) {
    return <NotFound>Invoice not found</NotFound>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="space-y-2 p-2">
        <p className="text-gray-600 dark:text-gray-400">
          Unable to load this invoice right now.
        </p>
        <p className="flex items-center gap-2 flex-wrap">
          <Link
            to="/dashboard/invoices"
            className="rounded-sm bg-cyan-600 px-2 py-1 text-sm font-black uppercase text-white"
          >
            Back to invoices
          </Link>
        </p>
        <ErrorComponent error={query.error as Error} />
      </div>
    );
  }

  return (
    <InvoiceManager
      data={query.data.data}
      onDeleted={() => {
        void navigate({ to: "/dashboard/invoices" });
      }}
      onSaved={() => {
        query.refetch();
      }}
    />
  );
}
