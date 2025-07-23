import { Metadata } from "next";
import { Suspense } from "react";
import { InvoicesList } from "@/components/invoices/InvoicesList";
import { Spinner } from "@/components/spinner/spinner";

export const metadata: Metadata = {
  title: "Invoices",
  description: "Wakana invoices, create and track invoices for billable hours.",
};

export default function Invoices() {
  return (
    <div className="my-6">
      <div className="mb-5 flex items-center justify-start">
        <h1 className="text-4xl">Invoices</h1>
      </div>
      <Suspense fallback={<Spinner />}>
        <InvoicesList />
      </Suspense>
    </div>
  );
}
