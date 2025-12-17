"use client";

import { format } from "date-fns";
import { Eye, LucidePlusCircle, LucideTrash2, Save } from "lucide-react";
import React from "react";

import { ApiClient } from "@/actions/api";
import { getCurrencySymbol } from "@/lib/constants/currencies";
import { Invoice, InvoiceLineItem } from "@/lib/types";
import { cn, formatNumber, getHours } from "@/lib/utils";

import { Icons } from "../icons";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { toast } from "../ui/use-toast";
import styles from "./invoice-manager.module.css";
import { InvoicePreview } from "./invoice-preview";

interface iProps {
  data: Invoice;
}

export function InvoiceManager({ data }: iProps) {
  const date = new Date();
  const { client } = data;
  const [loading, setLoading] = React.useState(false);

  const [lineItems, setLineItems] = React.useState<InvoiceLineItem[]>(
    data.line_items.map((line_item) => ({
      ...line_item,
      total: getHours(line_item.total_seconds),
    }))
  );
  const defaultInvoiceSubtitle = () => {
    return `Invoice for the month of ${format(date, "MMMM yyyy")}.`;
  };
  const [origin, setFrom] = React.useState(data.origin);
  const [destination, setDestination] = React.useState(
    data.destination || client.name
  );
  const [tax, setTax] = React.useState(data.tax || "");
  const [heading, setPreamble] = React.useState(data.heading);
  const [finalMessage, setMainMessage] = React.useState(data.final_message);
  const [invoiceSummary, setInvoiceSummary] = React.useState(
    data.invoice_summary || defaultInvoiceSubtitle()
  );
  const [preview, setPreview] = React.useState(true);
  const [showTax, setShowTax] = React.useState(!data.exclude_tax);

  const totalInvoice = React.useMemo(() => {
    return lineItems.reduce((acc, item) => {
      return acc + getHours(+item.total_seconds) * client.hourly_rate;
    }, 0);
  }, [lineItems, client.hourly_rate]);

  const taxTotal = React.useMemo(() => {
    if (!showTax) {
      return 0;
    }
    const parsedTax = parseInt(tax.toString());
    if (isNaN(parsedTax)) {
      return 0;
    }
    return totalInvoice * (parsedTax / 100);
  }, [totalInvoice, tax, showTax]);

  const netTotal = React.useMemo(() => {
    return totalInvoice + taxTotal;
  }, [totalInvoice, taxTotal]);

  const currencySymbol = getCurrencySymbol(client.currency);

  const deleteInvoiceItem = (index: number) => () => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const addNewItem = () => {
    setLineItems([
      ...lineItems,
      {
        title: "",
        total_seconds: 0,
        auto_generated: false,
      } as any,
    ]);
  };

  const resourceUrl = `/v1/users/current/invoices/${data.id}`;

  const saveInvoice = async () => {
    try {
      const payload: Record<
        string,
        string | number | boolean | InvoiceLineItem[]
      > = {
        origin,
        destination,
        heading,
        final_message: finalMessage,
        invoice_summary: invoiceSummary,
        line_items: lineItems,
        exclude_tax: !showTax,
      };
      if (tax && showTax) {
        payload.tax = +tax;
      }
      setLoading(true);
      const response = await ApiClient.PUT(resourceUrl, payload);

      if (!response.success) {
        toast({
          title: "Failed to update invoice",
          variant: "destructive",
          description: "Please try again later",
        });
      } else {
        toast({
          title: "Invoice Saved",
          variant: "success",
        });
        setPreview(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (preview) {
    return (
      <InvoicePreview
        data={{
          ...data,
          line_items: lineItems,
          heading,
          final_message: finalMessage,
          invoice_summary: invoiceSummary,
          tax: showTax ? +tax : 0,
          exclude_tax: !showTax,
        }}
        onTogglePreview={() => setPreview(!preview)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-white p-8 shadow-lg md:p-12">
          {/* Invoice for header with preview button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl text-black font-semibold">
              Invoice for <b>{client.name}</b>
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreview(true)}
              className="flex items-center gap-1.5 px-4 py-2 border-gray-300 text-black hover:bg-gray-50 text-sm"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
          </div>

          {/* Header with title */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-black mb-2">INVOICE</h1>
              <textarea
                rows={2}
                className={cn(
                  styles.invoiceInput,
                  "text-lg text-black resize-none border-none bg-transparent p-0 focus:bg-white focus:border focus:border-gray-300 focus:p-2"
                )}
                placeholder="Invoice Subtitle"
                defaultValue={invoiceSummary}
                onChange={(event) => setInvoiceSummary(event.target.value)}
              />
            </div>
          </div>

          {/* Content layout */}
          <div className="flex justify-between">
            <div className="w-100 w-full max-w-lg space-y-6">
              <div>
                <h2 className="text-sm font-medium text-black uppercase tracking-wider mb-2">
                  FROM
                </h2>
                <textarea
                  rows={4}
                  className={styles.invoiceInput}
                  placeholder="Your details"
                  defaultValue={origin}
                  onChange={(event) => setFrom(event.target.value)}
                />
              </div>

              <div>
                <h2 className="text-sm font-medium text-black uppercase tracking-wider mb-2">
                  BILL TO
                </h2>
                <textarea
                  id="to"
                  rows={4}
                  className={styles.invoiceInput}
                  placeholder="Billing address"
                  defaultValue={destination}
                  onChange={(event) => setDestination(event.target.value)}
                />
              </div>
            </div>

            <div className="text-right">
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-medium text-black uppercase tracking-wider mb-1">
                    INVOICE
                  </h2>
                  <p className="font-bold text-black">{data.invoice_id}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-black uppercase tracking-wider mb-1">
                    DATE
                  </h2>
                  <p className="text-black">
                    {format(new Date(date), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="from" className="text-sm font-medium text-black uppercase tracking-wider">Preamble</label>
            <textarea
              className={cn(styles.invoiceInput)}
              placeholder="Write something here"
              defaultValue={heading}
              onChange={(event) => setPreamble(event.target.value)}
            ></textarea>
          </div>
          {/* Items Table */}
          <div className="mt-8 mb-8">
            <div className={cn(styles.invoiceTableWrapper, "shadow")}>
              <table className={cn(styles.invoiceTable, "")}>
                <thead>
                  <tr className={cn(styles.invoiceRow, styles.invoiceHeader)}>
                    <th className="text-black">Item</th>
                    <th className="text-black">Price ({currencySymbol})</th>
                    <th className="text-black">Qty (Hrs)</th>
                    <th className="text-black">Amount ({currencySymbol})</th>
                    <th className={styles.invoiceRowAction}></th>
                  </tr>
                </thead>
                <tbody style={{ borderRadius: "0.5rem" }}>
                  {lineItems.map((item, index) => (
                    <tr key={index} className={cn(styles.invoiceRow)}>
                      <td>
                        <input
                          className={cn(
                            styles.invoiceInput,
                            styles.inputOutlined
                          )}
                          placeholder="Invoice Item"
                          defaultValue={item.title}
                          onChange={(event) => {
                            const newItems = [...lineItems];
                            newItems[index].title = event.target.value;
                            setLineItems(newItems);
                          }}
                        />
                      </td>
                      <td className="text-black">{client.hourly_rate.toFixed(2)}</td>
                      <td>
                        {!(item as InvoiceLineItem).auto_generated ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className={cn(
                              styles.invoiceInput,
                              styles.qtyInput,
                              "text-center"
                            )}
                            placeholder="0.00"
                            defaultValue={getHours(item.total_seconds || 0)}
                            onChange={(event) => {
                              const newItems = [...lineItems];
                              newItems[index].total_seconds =
                                parseFloat(event.target.value || "0") * 3600;
                              setLineItems(newItems);
                            }}
                          />
                        ) : (
                          <span className="text-black">{getHours(item.total_seconds).toFixed(2)}</span>
                        )}
                      </td>
                      <td className="text-black">
                        {/* How do I make the computation below reactive to the change in the total? */}
                        {/* {(item.total_seconds)} */}
                        {isNaN(parseFloat(String(item.total_seconds)))
                          ? 0
                          : (
                              getHours(item.total_seconds) * client.hourly_rate
                            ).toFixed(2)}
                      </td>
                      <td className={cn(styles.invoiceAction, "text-right")}>
                        <div className="flex justify-end">
                          <div
                            className="m-0 flex justify-center rounded-sm border border-red-400 p-0 text-red-400 hover:border-red-700 hover:text-red-700"
                            style={{ width: "25px", padding: "2px" }}
                          >
                            <LucideTrash2
                              onClick={deleteInvoiceItem(index)}
                              className="m-0 size-4 p-0 text-center "
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className={cn(styles.invoiceRow)}>
                    <td onClick={addNewItem}>
                      <span
                        className={cn(
                          styles.addItem,
                          "border border-slate-300"
                        )}
                      >
                        <LucidePlusCircle className="size-4" />
                        <span className="ml-2 text-black">Add item</span>
                      </span>
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="mt-12 flex justify-end">
            <div className="w-96 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-black">Subtotal:</span>
                <span className="font-bold text-black">
                  {formatNumber(totalInvoice, { currency: client.currency })}
                </span>
              </div>

              {/* Tax */}
              <div className="flex justify-between items-center text-lg">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-black">Tax:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      className="w-16 px-3 py-1 border border-gray-300 rounded text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={tax || ""}
                      onChange={(e) => setTax(e.currentTarget.value)}
                      placeholder="0"
                    />
                    <span className="text-black">%</span>
                  </div>
                </div>
                <span className="font-bold text-black">
                  {showTax
                    ? formatNumber(taxTotal, { currency: client.currency })
                    : "0"}
                </span>
              </div>

              {/* Divider */}
              <hr className="border-gray-300" />

              {/* Total */}
              <div className="flex justify-between items-center text-xl">
                <span className="font-bold text-black">Total:</span>
                <span className="font-bold text-black">
                  {formatNumber(showTax ? netTotal : totalInvoice, {
                    currency: client.currency,
                  })}
                </span>
              </div>

              {/* Include Tax Toggle */}
              <div className="flex justify-end items-center gap-3 pt-4">
                <span className="text-lg font-semibold text-black">Include Tax</span>
                <Switch
                  id="show-tax"
                  checked={showTax}
                  onCheckedChange={setShowTax}
                  className={`border-2 ${showTax ? 'border-white bg-black' : 'border-gray-800 bg-white'} data-[state=checked]:bg-black data-[state=checked]:border-white`}
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-black mb-3">Notes</h3>
            <textarea
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
              placeholder="Additional notes or payment terms"
              defaultValue={finalMessage}
              onChange={(event) => setMainMessage(event.target.value)}
            ></textarea>
          </div>
          <div className="flex justify-end items-center mt-8 pt-4">
            <Button
              onClick={saveInvoice}
              size="sm"
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 font-medium text-sm"
            >
              {loading ? (
                <div className="flex items-center gap-1.5">
                  <Icons.spinner className="animate-spin h-3.5 w-3.5" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  Save Invoice
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
