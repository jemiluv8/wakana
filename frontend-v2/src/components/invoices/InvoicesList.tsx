import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useNavigate, Link } from "@tanstack/react-router";
import { Eye, FilePenLine, MoreVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { apiFetch } from "~/lib/api";
import { useAuth } from "~/lib/providers/auth-provider";
import { convertSecondsToHours, formatNumber, humanizeDate } from "~/lib/utils";
import type { Client, Invoice } from "~/types";
import { Input } from "~/components/ui/input";

type ClientsResponse = {
  data: Client[];
};

type InvoicesResponse = {
  data: Invoice[];
};

export function InvoicesList() {
  const [filter, setFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const clientsQuery = useSuspenseQuery({
    queryKey: ["clients", user?.id ?? null],
    queryFn: () => apiFetch<ClientsResponse>("/v1/users/current/clients"),
  });

  const invoicesQuery = useSuspenseQuery({
    queryKey: ["invoices", user?.id ?? null],
    queryFn: () => apiFetch<InvoicesResponse>("/v1/users/current/invoices"),
  });

  const [invoiceRows, setInvoiceRows] = useState<Invoice[]>(
    invoicesQuery.data.data
  );

  const search = filter.toLowerCase();
  const invoices = invoiceRows.filter((invoice) => {
    const searchableText = [
      invoice.name,
      invoice.invoice_id,
      invoice.client?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search);
  });

  const createInvoice = async () => {
    if (!selectedClient || !startDate || !endDate) {
      toast.error("Select a client and date range");
      return;
    }

    const response = await apiFetch<{ data: Invoice }>(
      "/v1/users/current/invoices",
      {
        method: "POST",
        body: JSON.stringify({
          client_id: selectedClient,
          start_date: new Date(`${startDate}T00:00:00`).toISOString(),
          end_date: new Date(`${endDate}T23:59:59`).toISOString(),
        }),
      }
    );

    toast.success("Invoice created successfully");
    setInvoiceRows((current) => [response.data, ...current]);
    setCreateOpen(false);
    await navigate({
      to: "/dashboard/invoices/$id",
      params: { id: response.data.id },
    });
  };

  const deleteInvoice = async (invoice: Invoice) => {
    if (
      !window.confirm(`Delete invoice ${invoice.name || invoice.invoice_id}?`)
    ) {
      return;
    }

    const response = await apiFetch<{ success?: boolean }>(
      `/v1/users/current/invoices/${invoice.id}`,
      { method: "DELETE" }
    );

    if (response.success === false) {
      toast.error("Failed to delete invoice");
      return;
    }

    setInvoiceRows((current) => current.filter((item) => item.id !== invoice.id));
    toast.success("Invoice deleted");
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-5 py-4">
        <input
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Filter invoices"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
        <Button
          type="button"
          className="gap-2 whitespace-nowrap"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          Create Invoice
        </Button>
      </div>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left font-bold">Client</th>
              <th className="p-3 text-left font-bold">Billable Hours</th>
              <th className="p-3 text-left font-bold">Amount</th>
              <th className="p-3 text-left font-bold">Currency</th>
              <th className="p-3 text-left font-bold">Duration</th>
              <th className="p-3 text-left font-bold">Created</th>
              <th className="p-3 text-left font-bold">Updated</th>
              <th className="p-3 text-left font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length ? (
              invoices.map((invoice) => {
                const totalSeconds = invoice.line_items.reduce(
                  (total, item) => total + item.total_seconds,
                  0
                );
                const amount = (totalSeconds / 3600) * invoice.client.hourly_rate;

                return (
                  <tr key={invoice.id} className="border-b border-border/60">
                    <td className="p-3">{invoice.client.name}</td>
                    <td className="p-3">{convertSecondsToHours(totalSeconds)}</td>
                    <td className="p-3">
                      {formatNumber(amount, {
                        style: "currency",
                        currency: invoice.client.currency,
                      })}
                    </td>
                    <td className="p-3">{invoice.client.currency}</td>
                    <td className="p-3">
                      {format(new Date(invoice.start_date), "dd/MM/yyyy")} -{" "}
                      {format(new Date(invoice.end_date), "dd/MM/yyyy")}
                    </td>
                    <td className="p-3">{humanizeDate(invoice.created_at)}</td>
                    <td className="p-3">
                      {humanizeDate(invoice.updated_at ?? invoice.created_at)}
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              to="/dashboard/invoices/$id"
                              params={{ id: invoice.id }}
                              className="flex w-full items-center gap-2"
                            >
                              <Eye className="size-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/dashboard/invoices/$id"
                              params={{ id: invoice.id }}
                              className="flex w-full items-center gap-2"
                            >
                              <FilePenLine className="size-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteInvoice(invoice)}
                            className="flex items-center gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="h-24 text-center" colSpan={8}>
                  No invoices.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm">
          showing {invoices.length} results.
        </div>
        <div className="text-sm text-muted-foreground">
          {clientsQuery.data.data.length} clients available.
        </div>
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-background p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Create Invoice</h2>
                <p className="text-sm text-muted-foreground">
                  Pick a client and date range to create the invoice shell.
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-muted-foreground"
                onClick={() => setCreateOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium">Client</span>
                <select
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2"
                  value={selectedClient}
                  onChange={(event) => setSelectedClient(event.target.value)}
                >
                  <option value="">Select client</option>
                  {clientsQuery.data.data.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Start date</span>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">End date</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createInvoice}>Create</Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
