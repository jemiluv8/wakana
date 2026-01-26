import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";
import { trim } from "lodash";
import React from "react";

import { Invoice } from "@/lib/types";
import { formatCurrency, getHours } from "@/lib/utils";

// Use built-in Helvetica font family (no registration needed)

interface iProps {
  invoiceData: Invoice;
}

export const InvoicePDFViewer = ({ invoiceData }: iProps) => {
  const {
    client,
    line_items,
    tax,
    final_message,
    heading,
    origin,
    destination,
    created_at: date,
  } = invoiceData;

  const totalInvoice = React.useMemo(() => {
    return line_items.reduce((acc, item) => {
      return acc + getHours(item.total_seconds) * client.hourly_rate;
    }, 0);
  }, [line_items, client.hourly_rate]);

  const taxTotal = React.useMemo(() => {
    if (isNaN(tax)) {
      return 0;
    }
    return totalInvoice * (tax / 100);
  }, [totalInvoice, tax]);

  const netTotal = React.useMemo(() => {
    return totalInvoice + taxTotal;
  }, [totalInvoice, taxTotal]);

  const Header = () => (
    <View style={styles.header}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
        }}
      >
        <View>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
            {invoiceData.invoice_summary}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Document title="Invoice">
      <Page size="A4" style={styles.page}>
        <View style={styles.main}>
          <Header />

          {/* Content layout */}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 40,
            }}
          >
            <View style={{ maxWidth: "50%", flexDirection: "column", gap: 10 }}>
              <View style={{ marginBottom: 32 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#000",
                    marginBottom: 15,
                    fontFamily: "Helvetica",
                    letterSpacing: 0.5,
                  }}
                >
                  FROM
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: "#000",
                    lineHeight: 1.5,
                    paddingBottom: 10,
                  }}
                >
                  {origin}
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#000",
                    marginBottom: 15,
                    fontFamily: "Helvetica",
                    letterSpacing: 0.5,
                  }}
                >
                  BILL TO
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: "#000",
                    lineHeight: 1.5,
                    paddingBottom: 10,
                  }}
                >
                  {destination}
                </Text>
              </View>
            </View>

            <View style={{ textAlign: "right" }}>
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#000",
                    marginBottom: 4,
                    fontFamily: "Helvetica",
                    letterSpacing: 0.5,
                  }}
                >
                  INVOICE
                </Text>
                <Text style={{ fontSize: 11, color: "#000", fontWeight: 600 }}>
                  {invoiceData.invoice_id}
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#000",
                    marginBottom: 4,
                    fontFamily: "Helvetica",
                    letterSpacing: 0.5,
                  }}
                >
                  DATE
                </Text>
                <Text style={{ fontSize: 10, color: "#000" }}>
                  {format(date, "MMM dd, yyyy")}
                </Text>
              </View>
            </View>
          </View>

          {heading && (
            <View
              style={{
                // marginBottom: 32,
                // backgroundColor: "#F5F5F5",
                // paddingHorizontal: 10,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 10, color: "#333", lineHeight: 1.4 }}>
                {trim(heading)}
              </Text>
            </View>
          )}
          <View style={styles.cleanTable}>
            <View style={styles.cleanTableHeader}>
              <View
                style={[
                  styles.cleanTableCol,
                  { width: "40%", justifyContent: "space-evenly" },
                ]}
              >
                <Text style={[styles.cleanTableHeaderText]}>Item</Text>
              </View>
              <View
                style={[
                  styles.cleanTableCol,
                  styles.cleanTableColRight,
                  { width: "20%" },
                ]}
              >
                <Text style={styles.cleanTableHeaderText}>
                  Price ({client.currency})
                </Text>
              </View>
              <View
                style={[
                  styles.cleanTableCol,
                  styles.cleanTableColRight,
                  { width: "20%" },
                ]}
              >
                <Text style={styles.cleanTableHeaderText}>Qty (Hrs)</Text>
              </View>
              <View
                style={[
                  styles.cleanTableCol,
                  styles.cleanTableColRight,
                  { width: "20%" },
                ]}
              >
                <Text style={styles.cleanTableHeaderText}>
                  Amount ({client.currency})
                </Text>
              </View>
            </View>
            {line_items?.map((item) => (
              <View style={styles.cleanTableRow} key={item.title}>
                <View
                  style={[
                    styles.cleanTableCol,
                    { width: "40%", justifyContent: "center" },
                  ]}
                >
                  <Text style={[styles.cleanTableCell, { textAlign: "left" }]}>
                    {item.title}
                  </Text>
                </View>
                <View
                  style={[
                    styles.cleanTableCol,
                    styles.cleanTableColRight,
                    { width: "20%" },
                  ]}
                >
                  <Text style={styles.cleanTableCell}>
                    {client.hourly_rate.toFixed(2)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.cleanTableCol,
                    styles.cleanTableColRight,
                    { width: "20%" },
                  ]}
                >
                  <Text style={styles.cleanTableCell}>
                    {getHours(item.total_seconds).toFixed(2)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.cleanTableCol,
                    styles.cleanTableColRight,
                    { width: "20%" },
                  ]}
                >
                  <Text style={styles.cleanTableCell}>
                    {formatCurrency(
                      client.hourly_rate * getHours(item.total_seconds),
                      client.currency
                    )}
                  </Text>
                </View>
              </View>
            ))}

            {/* Subtotal Row */}
            <View style={styles.cleanTableTotalRow}>
              <View style={[styles.cleanTableCol, { width: "40%" }]}></View>
              <View style={[styles.cleanTableCol, { width: "20%" }]}></View>
              <View
                style={[
                  styles.cleanTableCol,
                  styles.cleanTableColRight,
                  { width: "20%" },
                ]}
              >
                <Text style={styles.cleanTableTotalLabel}>Subtotal:</Text>
              </View>
              <View
                style={[
                  styles.cleanTableCol,
                  styles.cleanTableColRight,
                  { width: "20%" },
                ]}
              >
                <Text style={styles.cleanTableTotalValue}>
                  {formatCurrency(totalInvoice, client.currency)}
                </Text>
              </View>
            </View>

            {/* Final Total Row */}
            <View style={styles.cleanTableFinalRow}>
              <View style={[styles.cleanTableCol, { width: "40%" }]}></View>
              <View style={[styles.cleanTableCol, { width: "20%" }]}></View>
              <View
                style={[
                  styles.cleanTableCol,
                  styles.cleanTableColRight,
                  { width: "20%" },
                ]}
              >
                <Text style={styles.cleanTableFinalLabel}>Total:</Text>
              </View>
              <View
                style={[
                  styles.cleanTableCol,
                  styles.cleanTableColRight,
                  { width: "20%" },
                ]}
              >
                <Text style={styles.cleanTableFinalValue}>
                  {formatCurrency(netTotal, client.currency)}
                </Text>
              </View>
            </View>
          </View>
          {/* Notes Section */}
          {final_message && (
            <View style={{ marginTop: 40 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#333",
                  marginBottom: 8,
                  fontFamily: "Helvetica",
                }}
              >
                NOTES
              </Text>
              <Text style={{ fontSize: 10, color: "#333", lineHeight: 1.5 }}>
                {final_message}
              </Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  viewer: {
    paddingTop: 32,
    width: "100%",
    height: "80vh",
    border: "none",
  },
  page: {
    display: "flex",
    padding: "0.4in 0.28in",
    fontSize: 10,
    color: "#333",
    backgroundColor: "#fff",
    fontFamily: "Helvetica",
  },
  tableHeader: {
    backgroundColor: "rgb(250, 250, 250)",
    color: "#000000",
    fontSize: 16,
    fontWeight: 700,
    // fontFamily: "'__Rubik_b539cb', '__Rubik_Fallback_b539cb'",
  },
  table: {
    display: "flex",
    width: "auto",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 24,
    border: "1px solid rgb(217, 217, 217)",
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  mutedText: {
    color: "gray",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#d9d9d9",
  },
  tableCell: {
    margin: "auto",
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 10,
  },
  divider: {
    width: "100%",
    height: 1,
    marginTop: 32,
    marginBottom: 32,
    backgroundColor: "#D9D9D9",
  },
  totalDivider: {
    width: "100%",
    height: 1,
    marginTop: 2,
    marginBottom: 2,
    backgroundColor: "#D9D9D9",
  },
  main: {
    transitionProperty: "box-shadow, transform",
    transitionDuration: "0.4s",
    transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)",
    overflow: "hidden",
    width: "100%",
    height: "100%",
    paddingBottom: 60,
    paddingLeft: 40,
    paddingRight: 40,
    backgroundColor: "hsl(0deg 0% 100%)",
    boxShadow:
      " 0 0 0 1px rgba(0, 0, 0, 0.05), 0 7px 25px 0 rgba(0, 0, 0, 0.03), 0 4px 12px 0 rgba(0, 0, 0, 0.03)",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 32,
  },
  invoiceTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: "#000000",
    marginBottom: 4,
    fontFamily: "Helvetica",
  },
  flexRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flexCol: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flexColEnd: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  flexColStart: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  invoiceTotalsTitle: {
    fontSize: 11,
    fontWeight: 700,
  },
  invoiceTotalsValue: {
    fontSize: 11,
    color: "hsl(0deg 0.42% 53.53%)",
  },
  tableHeaderText: {
    fontWeight: 700,
  },
  // Clean table styles
  cleanTable: {
    display: "flex",
    flexDirection: "column",
    marginTop: 24,
    border: "1px solid #E5E7EB",
    borderRadius: 4,
  },
  cleanTableHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  cleanTableRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cleanTableCol: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 20,
  },
  cleanTableColRight: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 20,
  },
  cleanTableHeaderText: {
    fontSize: 10,
    fontWeight: 900,
    color: "#333",
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    lineHeight: 1.4,
  },
  cleanTableCell: {
    fontSize: 10,
    color: "#333",
    textAlign: "center",
    lineHeight: 1.4,
  },
  cleanTableTotalRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cleanTableTotalLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#333",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  cleanTableTotalValue: {
    fontSize: 11,
    fontWeight: 700,
    color: "#333",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  cleanTableFinalRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 2,
    borderTopColor: "#DBEAFE",
  },
  cleanTableFinalLabel: {
    fontSize: 12,
    fontWeight: 900,
    color: "#333",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  cleanTableFinalValue: {
    fontSize: 12,
    fontWeight: 900,
    color: "#333",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
});
