import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { MoreVertical, Plus, PencilLine, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { CURRENCIES } from "~/lib/constants/currencies";
import { apiFetch } from "~/lib/api";
import { useAuth } from "~/lib/providers/auth-provider";
import { humanizeDate } from "~/lib/utils";
import type { Client } from "~/types";

type ClientsResponse = {
  data: Client[];
};

type ClientFormState = {
  name: string;
  hourly_rate: string;
  currency: string;
  projects: string;
};

const emptyForm = (): ClientFormState => ({
  name: "",
  hourly_rate: "",
  currency: "USD",
  projects: "",
});

export function ClientsList() {
  const { user } = useAuth();
  const { data } = useSuspenseQuery({
    queryKey: ["clients", user?.id ?? null],
    queryFn: () => apiFetch<ClientsResponse>("/v1/users/current/clients"),
  });

  const [clients, setClients] = useState<Client[]>(data.data);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormState>(emptyForm);

  const filteredClients = useMemo(() => {
    const search = filter.toLowerCase();
    return clients.filter((client) =>
      [client.name, client.currency, client.projects.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [clients, filter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setForm({
      name: client.name,
      hourly_rate: String(client.hourly_rate),
      currency: client.currency,
      projects: client.projects.join(", "),
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setLoading(false);
  };

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Client name is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      hourly_rate: Number(form.hourly_rate || 0),
      currency: form.currency.trim() || "USD",
      projects: form.projects
        .split(",")
        .map((project) => project.trim())
        .filter(Boolean),
    };

    try {
      setLoading(true);
      if (editing) {
        const response = await apiFetch<{ success?: boolean; data: Client }>(
          `/v1/users/current/clients/${editing.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        if (response.success === false) {
          toast.error("Failed to update client");
          return;
        }

        setClients((current) =>
          current.map((client) =>
            client.id === editing.id ? response.data ?? { ...client, ...payload } : client
          )
        );
        toast.success("Client updated");
      } else {
        const response = await apiFetch<{ success?: boolean; data: Client }>(
          "/v1/users/current/clients",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (response.success === false) {
          toast.error("Failed to create client");
          return;
        }

        const nextClient = response.data ?? {
          ...payload,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setClients((current) => [nextClient, ...current]);
        toast.success("Client created");
      }

      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (client: Client) => {
    if (!window.confirm(`Delete client: ${client.name}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch<{ success?: boolean }>(
        `/v1/users/current/clients/${client.id}`,
        { method: "DELETE" }
      );

      if (response.success === false) {
        toast.error("Failed to delete client");
        return;
      }

      setClients((current) => current.filter((item) => item.id !== client.id));
      toast.success("Client deleted");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-5 py-4">
        <Input
          placeholder="Filter clients"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="w-full md:max-w-md"
        />
        <Button type="button" className="gap-2 whitespace-nowrap" onClick={openCreate}>
          <Plus className="size-4" />
          New Client
        </Button>
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
              <th className="p-3 text-left font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length ? (
              filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-border/60">
                  <td className="p-3">{client.name}</td>
                  <td className="p-3">
                    {client.projects.length ? client.projects.join(", ") : "-"}
                  </td>
                  <td className="p-3">{client.currency}</td>
                  <td className="p-3">{client.hourly_rate}</td>
                  <td className="p-3">{humanizeDate(client.created_at)}</td>
                  <td className="p-3">{humanizeDate(client.updated_at)}</td>
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
                        <DropdownMenuItem
                          onClick={() => openEdit(client)}
                          className="flex items-center gap-2"
                        >
                          <PencilLine className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteClient(client)}
                          className="flex items-center gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="h-24 text-center" colSpan={7}>
                  You have no clients.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm">
          showing {filteredClients.length} results.
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-background p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {editing ? "Edit Client" : "New Client"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {editing
                    ? "Update the client details and associated projects."
                    : "Create a client to group tracked time and billing."}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeModal}
                aria-label="Close client modal"
              >
                <Icons.close className="size-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium">Name</span>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Currency</span>
                  <Select
                    value={form.currency}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        currency: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          {currency.id} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Rate / Hr</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.hourly_rate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        hourly_rate: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium">
                  Projects, comma separated
                </span>
                <Textarea
                  rows={4}
                  value={form.projects}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      projects: event.target.value,
                    }))
                  }
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={closeModal} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={loading}>
                  {editing ? "Save Client" : "Create Client"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
