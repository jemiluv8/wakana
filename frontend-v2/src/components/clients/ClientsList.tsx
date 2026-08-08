import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";

import { apiFetch } from "~/lib/api";
import { useAuth } from "~/lib/providers/auth-provider";
import { humanizeDate } from "~/lib/utils";
import type { Client } from "~/types";

type ClientsResponse = {
  data: Client[];
};

export function ClientsList() {
  const [filter, setFilter] = useState("");
  const { user } = useAuth();

  const { data } = useSuspenseQuery({
    queryKey: ["clients", user?.id ?? null],
    queryFn: () => apiFetch<ClientsResponse>("/v1/users/current/clients"),
  });

  const clients = data.data.filter((client) =>
    client.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-5 py-4">
        <input
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Filter clients"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left font-bold">Name</th>
              <th className="p-3 text-left font-bold">Projects</th>
              <th className="p-3 text-left font-bold">Currency</th>
              <th className="p-3 text-left font-bold">Rate/Hr</th>
              <th className="p-3 text-left font-bold">Created</th>
              <th className="p-3 text-left font-bold">Updated</th>
            </tr>
          </thead>
          <tbody>
            {clients.length ? (
              clients.map((client) => (
                <tr key={client.id} className="border-b border-border/60">
                  <td className="p-3">{client.name}</td>
                  <td className="p-3">
                    {client.projects.length ? client.projects.join(", ") : "-"}
                  </td>
                  <td className="p-3">{client.currency}</td>
                  <td className="p-3">{client.hourly_rate}</td>
                  <td className="p-3">{humanizeDate(client.created_at)}</td>
                  <td className="p-3">{humanizeDate(client.updated_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="h-24 text-center" colSpan={6}>
                  You have no clients.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm">showing {clients.length} results.</div>
      </div>
    </div>
  );
}
