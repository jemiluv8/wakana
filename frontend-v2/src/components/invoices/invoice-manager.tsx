import { useMemo, useState } from "react";

import { format } from "date-fns";
import { Eye, LucidePlusCircle, LucideTrash2, Save } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "~/lib/api";
import { cn, formatNumber, getHours } from "~/lib/utils";
import type { Invoice, InvoiceLineItem } from "~/types";

import { Icons } from "../icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { InvoicePreview } from "./invoice-preview";

type Props = {
  data: Invoice;
  onDeleted?: () => void;
  onSaved?: (invoice: Invoice) => void;
};

function cloneLineItems(items: InvoiceLineItem[]) {
  return items.map((item) => ({ ...item }));
}

export function InvoiceManager({ data, onDeleted, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(true);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    cloneLineItems(data.line_items)
  );
  const [origin, setOrigin] = useState(data.origin);
  const [destination, setDestination] = useState(
    data.destination || data.client.name
  );
  const [tax, setTax] = useState(String(data.tax ?? ""));
  const [heading, setHeading] = useState(data.heading);
  const [finalMessage, setFinalMessage] = useState(data.final_message);
  const [invoiceSummary, setInvoiceSummary] = useState(
    data.invoice_summary ||
      `Invoice for the month of ${format(new Date(), "MMMM yyyy")}.`
  );
  const [showTax, setShowTax] = useState(!data.exclude_tax);

  const totalInvoice = useMemo(() => {
    return lineItems.reduce((acc, item) => {
      return acc + getHours(item.total_seconds) * data.client.hourly_rate;
    }, 0);
  }, [data.client.hourly_rate, lineItems]);

  const taxTotal = useMemo(() => {
    if (!showTax) {
      return 0;
    }

    const parsedTax = Number.parseInt(tax, 10);
    if (Number.isNaN(parsedTax)) {
      return 0;
    }

    return totalInvoice * (parsedTax / 100);
  }, [showTax, tax, totalInvoice]);

  const netTotal = totalInvoice + taxTotal;

  const addNewItem = () => {
    setLineItems([
      ...lineItems,
      {
        title: "",
        total_seconds: 0,
        auto_generated: false,
      },
    ]);
  };

  const deleteInvoiceItem = (index: number) => {
    setLineItems(lineItems.filter((_, itemIndex) => itemIndex !== index));
  };

  const saveInvoice = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ success?: boolean; data?: Invoice }>(
        `/v1/users/current/invoices/${data.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            origin,
            destination,
            heading,
            final_message: finalMessage,
            invoice_summary: invoiceSummary,
            line_items: lineItems,
            exclude_tax: !showTax,
            tax:
              showTax && tax && !Number.isNaN(Number(tax))
                ? Number(tax)
                : undefined,
          }),
        }
      );

      if (response.success === false) {
        toast.error("Failed to update invoice");
        return;
      }

      toast.success("Invoice saved");
      setPreview(true);
      onSaved?.(response.data ?? data);
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async () => {
    if (!window.confirm(`Delete invoice ${data.name || data.invoice_id}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch<{ success?: boolean }>(
        `/v1/users/current/invoices/${data.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.success === false) {
        toast.error("Failed to delete invoice");
        return;
      }

      toast.success("Invoice deleted");
      onDeleted?.();
    } finally {
      setLoading(false);
    }
  };

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreview(false)}
            className="gap-2 border-gray-300 bg-white text-black hover:bg-gray-100 hover:text-black"
          >
            <Eye className="size-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteInvoice}
            disabled={loading}
          >
            Delete
          </Button>
        </div>
        <InvoicePreview
          data={{
            ...data,
            origin,
            destination,
            heading,
            final_message: finalMessage,
            invoice_summary: invoiceSummary,
            line_items: lineItems,
            tax: showTax ? Number(tax || 0) : 0,
            exclude_tax: !showTax,
          }}
          onTogglePreview={() => setPreview(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 text-black md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-white p-8 shadow-lg md:p-12">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-black">
              Invoice for <b>{data.client.name}</b>
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreview(true)}
                className="gap-1.5 border-gray-300 bg-white text-black hover:bg-gray-100 hover:text-black"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteInvoice}
                disabled={loading}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="mb-8 flex justify-between gap-8">
            <div className="w-full max-w-lg space-y-6">
              <div>
                <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-black">
                  FROM
                </h2>
                <Textarea
                  rows={4}
                  className="border border-gray-300 bg-gray-100 text-black placeholder:text-gray-500 shadow-sm focus:border-gray-400 focus:bg-gray-50"
                  placeholder="Your details"
                  value={origin}
                  onChange={(event) => setOrigin(event.target.value)}
                />
              </div>

              <div>
                <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-black">
                  BILL TO
                </h2>
                <Textarea
                  rows={4}
                  className="border border-gray-300 bg-gray-100 text-black placeholder:text-gray-500 shadow-sm focus:border-gray-400 focus:bg-gray-50"
                  placeholder="Billing address"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                />
              </div>
            </div>

            <div className="text-right">
              <div className="space-y-4">
                <div>
                  <h2 className="mb-1 text-sm font-medium uppercase tracking-wider text-black">
                    INVOICE
                  </h2>
                  <p className="font-bold text-black">{data.invoice_id}</p>
                </div>

                <div>
                  <h2 className="mb-1 text-sm font-medium uppercase tracking-wider text-black">
                    DATE
                  </h2>
                  <p className="text-black">
                    {format(new Date(data.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="invoice-subtitle"
              className="text-sm font-medium uppercase tracking-wider text-black"
            >
              Preamble
            </label>
            <Textarea
              id="invoice-subtitle"
              className="mt-2 border border-gray-300 bg-gray-100 text-black placeholder:text-gray-500 shadow-sm focus:border-gray-400 focus:bg-gray-50"
              placeholder="Write something here"
              value={heading}
              onChange={(event) => setHeading(event.target.value)}
            />
          </div>

          <div className="mb-8 mt-8">
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                      Price ({data.client.currency})
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                      Qty (Hrs)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                      Amount ({data.client.currency})
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={`${item.title}-${index}`} className="border-t">
                      <td className="px-4 py-2">
                        <Input
                          placeholder="Invoice Item"
                          value={item.title}
                          className="bg-white text-black placeholder:text-gray-400"
                          onChange={(event) => {
                            const next = [...lineItems];
                            next[index] = {
                              ...next[index],
                              title: event.target.value,
                            };
                            setLineItems(next);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 text-black">
                        {data.client.hourly_rate.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        {item.auto_generated ? (
                          <span className="text-black">
                            {getHours(item.total_seconds).toFixed(2)}
                          </span>
                        ) : (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="bg-white text-center text-black placeholder:text-gray-400"
                            placeholder="0.00"
                            value={String(getHours(item.total_seconds) || "")}
                            onChange={(event) => {
                              const next = [...lineItems];
                              next[index] = {
                                ...next[index],
                                total_seconds:
                                  Number.parseFloat(event.target.value || "0") *
                                  3600,
                              };
                              setLineItems(next);
                            }}
                          />
                        )}
                      </td>
                      <td className="px-4 py-2 text-black">
                        {formatNumber(
                          getHours(item.total_seconds) * data.client.hourly_rate,
                          {
                            style: "currency",
                            currency: data.client.currency,
                          }
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteInvoiceItem(index)}
                        >
                          <LucideTrash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="px-4 py-3" onClick={addNewItem}>
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm text-black",
                          "hover:bg-slate-50"
                        )}
                      >
                        <LucidePlusCircle className="size-4" />
                        <span className="ml-2">Add item</span>
                      </button>
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="mt-12 flex justify-end">
            <div className="w-96 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-black">Subtotals:</span>
                <span className="font-bold text-black">
                  {formatNumber(totalInvoice, {
                    style: "currency",
                    currency: data.client.currency,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-black">Tax:</span>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      className="w-16 bg-white text-center text-black [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      value={tax}
                      onChange={(e) => setTax(e.currentTarget.value)}
                      placeholder="0"
                    />
                    <span className="text-black">%</span>
                  </div>
                </div>
                <span className="font-bold text-black">
                  {showTax
                    ? formatNumber(taxTotal, {
                        style: "currency",
                        currency: data.client.currency,
                      })
                    : "0"}
                </span>
              </div>

              <hr className="border-gray-300" />

              <div className="flex items-center justify-between text-xl">
                <span className="font-bold text-black">Total:</span>
                <span className="font-bold text-black">
                  {formatNumber(showTax ? netTotal : totalInvoice, {
                    style: "currency",
                    currency: data.client.currency,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <span className="text-lg font-semibold text-black">
                  Include Tax
                </span>
                <Switch
                  id="show-tax"
                  checked={showTax}
                  onCheckedChange={setShowTax}
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-lg font-semibold text-black">Notes</h3>
            <Textarea
              className="h-32 resize-none border border-gray-300 bg-white px-4 py-3 text-black placeholder:text-gray-400"
              placeholder="Additional notes or payment terms"
              value={finalMessage}
              onChange={(event) => setFinalMessage(event.target.value)}
            />
          </div>

          <div className="mt-8 flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreview(true)}
              className="gap-1.5 border-gray-300 bg-white text-black hover:bg-gray-100 hover:text-black"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
            <Button onClick={saveInvoice} size="sm" className="gap-1.5">
              {loading ? (
                <>
                  <Icons.spinner className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Invoice
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
