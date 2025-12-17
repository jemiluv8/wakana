"use client";

import dynamic from "next/dynamic";
import { LucidePrinter } from "lucide-react";

import { Invoice } from "@/lib/types";

import { Button } from "../ui/button";

interface iProps {
  invoiceData: Invoice;
}

// Dynamically import the entire PDF component with SSR disabled
const PDFDownloadButton = dynamic(
  () => import("./pdf-download-button").then((mod) => mod.PDFDownloadButton),
  { 
    ssr: false,
    loading: () => (
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 bg-transparent border-gray-300"
        disabled
      >
        <LucidePrinter className="h-4 w-4 text-black" />
      </Button>
    )
  }
);

export const InvoicePDF = (props: iProps) => {
  return <PDFDownloadButton invoiceData={props.invoiceData} />;
};