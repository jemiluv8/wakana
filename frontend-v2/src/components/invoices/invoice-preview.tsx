import { format } from "date-fns";
import { Edit3 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn, formatNumber, getHours } from "~/lib/utils";
import type { Invoice } from "~/types";

type Props = {
  data: Invoice;
  onTogglePreview: () => void;
};

export function InvoicePreview({ data, onTogglePreview }: Props) {
  const { client, tax, line_items, exclude_tax } = data;
  const showTax = !exclude_tax && tax > 0;

  const totalInvoice = line_items.reduce((acc, item) => {
    return acc + getHours(item.total_seconds) * client.hourly_rate;
  }, 0);

  const totalHours = line_items.reduce((acc, item) => {
    return acc + getHours(item.total_seconds);
  }, 0);

  const taxTotal = showTax ? totalInvoice * (tax / 100) : 0;
  const netTotal = totalInvoice + taxTotal;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-white p-8 shadow-lg md:p-12">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-black">INVOICE</h1>
              <div className="text-sm text-gray-600 whitespace-pre-line">
                {data.invoice_summary}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={onTogglePreview}
              className="h-10 w-10 border-gray-300 bg-white text-black hover:bg-gray-100 hover:text-black"
            >
              <Edit3 className="h-4 w-4 text-black" />
            </Button>
          </div>

          <div className="mb-8 flex justify-between gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase text-gray-600">
                  From
                </h3>
                <div className="whitespace-pre-line text-sm text-black">
                  {data.origin}
                </div>
              </div>

              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase text-gray-600">
                  Bill To
                </h3>
                <div className="whitespace-pre-line text-sm text-black">
                  {data.destination}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="mb-3">
                <div className="text-xs font-semibold uppercase text-gray-600">
                  Invoice
                </div>
                <div className="text-sm font-semibold text-black">
                  {data.invoice_id}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-gray-600">
                  Date
                </div>
                <div className="text-sm text-black">
                  {format(new Date(data.created_at), "MMM dd, yyyy")}
                </div>
              </div>
            </div>
          </div>

          {data.heading ? (
            <div className="mb-8 rounded-lg bg-gray-50 p-4">
              <div className="whitespace-pre-line text-black">{data.heading}</div>
            </div>
          ) : null}

          <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                    Item
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-black">
                    Price ({client.currency})
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-black">
                    Qty (Hrs)
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-black">
                    Amount ({client.currency})
                  </th>
                </tr>
              </thead>
              <tbody>
                {line_items.map((item, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-sm text-black">
                      {item.title}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-black">
                      {client.hourly_rate.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-black">
                      {getHours(item.total_seconds).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-black">
                      {formatNumber(
                        getHours(item.total_seconds) * client.hourly_rate,
                        {
                          style: "currency",
                          currency: client.currency,
                        }
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-right text-sm font-semibold text-black"
                  >
                    {totalHours.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-black">
                    {formatNumber(totalInvoice, {
                      style: "currency",
                      currency: client.currency,
                    })}
                  </td>
                </tr>
                {showTax && taxTotal > 0 ? (
                  <tr className="border-t border-gray-200">
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-right text-sm text-black"
                    >
                      Tax ({tax || 0}%):
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-black">
                      {formatNumber(taxTotal, {
                        style: "currency",
                        currency: client.currency,
                      })}
                    </td>
                  </tr>
                ) : null}
                <tr className="border-t border-gray-200 bg-blue-50">
                  <td
                    colSpan={3}
                    className="px-4 py-4 text-right text-base font-bold text-black"
                  >
                    Total:
                  </td>
                  <td className="px-4 py-4 text-right text-base font-bold text-black">
                    {formatNumber(showTax ? netTotal : totalInvoice, {
                      style: "currency",
                      currency: client.currency,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {data.final_message ? (
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase text-gray-600">
                Notes
              </h3>
              <div className="whitespace-pre-line text-sm text-black">
                {data.final_message}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
