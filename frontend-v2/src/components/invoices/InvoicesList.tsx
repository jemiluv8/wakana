import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { apiFetch } from "~/lib/api";
import { useAuth } from "~/lib/providers/auth-provider";
import { convertSecondsToHours, formatNumber, humanizeDate } from "~/lib/utils";
import type { Client, Invoice } from "~/types";

type ClientsResponse = {
  data: Client[];
};

type InvoicesResponse = {
  data: Invoice[];
};

export function InvoicesList() {
  const [filter, setFilter] = useState("");
  const { user } = useAuth();

  const clientsQuery = useSuspenseQuery({
    queryKey: ["clients", user?.id ?? null],
    queryFn: () => apiFetch<ClientsResponse>("/v1/users/current/clients"),
  });

  const invoicesQuery = useSuspenseQuery({
    queryKey: ["invoices", user?.id ?? null],
    queryFn: () => apiFetch<InvoicesResponse>("/v1/users/current/invoices"),
  });

  const search = filter.toLowerCase();
  const invoices = invoicesQuery.data.data.filter((invoice) => {
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-5 py-4">
        <input
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Filter invoices"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
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
                      {format(invoice.start_date, "dd/MM/yyyy")} -{" "}
                      {format(invoice.end_date, "dd/MM/yyyy")}
                    </td>
                    <td className="p-3">{humanizeDate(invoice.created_at)}</td>
                    <td className="p-3">
                      {humanizeDate(invoice.updated_at ?? invoice.created_at)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="h-24 text-center" colSpan={7}>
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
    </div>
  );
}
