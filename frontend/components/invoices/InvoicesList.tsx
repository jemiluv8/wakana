import { fetchData } from "@/actions";
import { ClientsApiResponse } from "@/components/clients-table";
import { InvoicesTable } from "@/components/invoice-table";
import { Invoice } from "@/lib/types";

export async function InvoicesList() {
  const clients = await fetchData<ClientsApiResponse>(
    "/v1/users/current/clients"
  );
  const invoices = await fetchData<{ data: Invoice[] }>(
    "/v1/users/current/invoices"
  );

  return (
    <InvoicesTable
      clients={clients?.data || []}
      invoices={invoices?.data || []}
    />
  );
}