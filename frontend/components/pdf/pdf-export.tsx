import dynamic from "next/dynamic";

// Dynamically import PDFDownloadLink with SSR disabled
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

import { LucidePrinter } from "lucide-react";

import { Invoice } from "@/lib/types";

import { Button } from "../ui/button";
import { InvoicePDFViewer } from "./invoice-pdf-viewer";

interface iProps {
  invoiceData: Invoice;
}

export const InvoicePDF = (props: iProps) => {
  return (
    <PDFDownloadLink
      fileName="invoice.pdf"
      document={<InvoicePDFViewer invoiceData={props.invoiceData} />}
    >
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 bg-transparent border-gray-300"
      >
        <LucidePrinter className="h-4 w-4 text-black" />
      </Button>
    </PDFDownloadLink>
  );
};
