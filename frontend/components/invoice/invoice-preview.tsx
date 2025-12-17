"use client";

import { format } from "date-fns";
import { LucideEdit } from "lucide-react";
import React from "react";

import { Invoice } from "@/lib/types";
import { cn, formatCurrency, formatNumber, getHours } from "@/lib/utils";

import { InvoicePDF } from "../pdf/pdf-export";
import { RawHTML } from "../raw-html";
import { Button } from "../ui/button";
import styles from "./invoice-manager.module.css";

interface iProps {
  data: Invoice;
  onTogglePreview: () => void;
}

export function InvoicePreview({ data, onTogglePreview }: iProps) {
  const { client, tax, line_items, exclude_tax } = data;

  const showTax = !exclude_tax && tax > 0;

  const totalInvoice = React.useMemo(() => {
    return line_items.reduce((acc, item) => {
      return acc + getHours(item.total_seconds) * client.hourly_rate;
    }, 0);
  }, [line_items, client.hourly_rate]);

  const taxTotal = React.useMemo(() => {
    if (!showTax || isNaN(tax)) {
      return 0;
    }
    return totalInvoice * (tax / 100);
  }, [totalInvoice, tax, showTax]);

  const netTotal = React.useMemo(() => {
    return totalInvoice + taxTotal;
  }, [totalInvoice, taxTotal]);

  const currencySymbol = client.currency;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-white p-8 shadow-lg md:p-12" id="target-invoice">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-black">INVOICE</h1>
              <div className="text-sm text-gray-600">
                <RawHTML source={data.invoice_summary} fallback="" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={onTogglePreview} className="h-10 w-10 bg-transparent border-gray-300">
                <LucideEdit className="h-4 w-4 text-black" />
              </Button>
              <InvoicePDF invoiceData={data} />
            </div>
          </div>

          <div className="mb-8 flex justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase text-gray-600">From</h3>
                <div className="whitespace-pre-line text-sm text-black">
                  <RawHTML source={data.origin} fallback="" />
                </div>
              </div>

              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase text-gray-600">Bill To</h3>
                <div className="whitespace-pre-line text-sm text-black">
                  <RawHTML source={data.destination} fallback="" />
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="mb-3">
                <div className="text-xs font-semibold uppercase text-gray-600">Invoice</div>
                <div className="text-sm font-semibold text-black">{data.invoice_id}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-gray-600">Date</div>
                <div className="text-sm text-black">{format(data.created_at, "MMM dd, yyyy")}</div>
              </div>
            </div>
          </div>
          {data.heading && (
            <div className="mb-8 rounded-lg bg-gray-50 p-4">
              <div className="text-black">
                <RawHTML source={data.heading} fallback="" />
              </div>
            </div>
          )}
          <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">Item</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-black">Price ({currencySymbol})</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-black">Qty (Hrs)</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-black">Amount ({currencySymbol})</th>
                </tr>
              </thead>
              <tbody>
                {line_items.map((item, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-sm text-black">{item.title}</td>
                    <td className="px-4 py-3 text-right text-sm text-black">{client.hourly_rate.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm text-black">{getHours(item.total_seconds).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-black">
                      {formatCurrency(
                        getHours(item.total_seconds) * client.hourly_rate,
                        currencySymbol
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-black">
                    Subtotal:
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-black">
                    {formatCurrency(totalInvoice, currencySymbol)}
                  </td>
                </tr>
                {showTax && taxTotal > 0 && (
                  <tr className="border-t border-gray-200">
                    <td colSpan={3} className="px-4 py-3 text-right text-sm text-black">
                      Tax ({tax || 0}%):
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-black">
                      {formatCurrency(taxTotal, currencySymbol)}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-gray-200 bg-blue-50">
                  <td colSpan={3} className="px-4 py-4 text-right text-base font-bold text-black">
                    Total:
                  </td>
                  <td className="px-4 py-4 text-right text-base font-bold text-black">
                    {formatCurrency(showTax ? netTotal : totalInvoice, currencySymbol)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {data.final_message && (
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase text-gray-600">Notes</h3>
              <div className="whitespace-pre-line text-sm text-black">
                <RawHTML source={data.final_message} fallback="" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
