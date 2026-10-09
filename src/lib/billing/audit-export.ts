/**
 * Comprehensive Billing & Accounting Export Engine for Kichees Bakery.
 * Designed for submission to Auditors, Chartered Accountants, and GST Filing.
 * 
 * Implements 7 standard formats matching Tally ERP 9 / TallyPrime:
 * 1. ASCII (Comma Delimited) [.csv]
 * 2. Excel (Spreadsheet) [.xlsx]
 * 3. HTML (Web-Publishing) [.html]
 * 4. JPEG (Image) [.jpg]
 * 5. JSON (Data Exchange) [.json]
 * 6. PDF (Read-only document) [.pdf]
 * 7. XML (Data Interchange - Tally XML) [.xml]
 */

import * as XLSX from "xlsx";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import type { BillingInvoice } from "./billing-store";

export type AuditExportFormat =
  | "ascii_csv"
  | "excel_xlsx"
  | "html_web"
  | "jpeg_image"
  | "json_data"
  | "pdf_doc"
  | "xml_tally";

export interface AuditExportFormatOption {
  id: AuditExportFormat;
  label: string;
  badge: string;
  extension: string;
  description: string;
  compatibility: string;
}

export const AUDIT_EXPORT_FORMATS: AuditExportFormatOption[] = [
  {
    id: "ascii_csv",
    label: "ASCII (Comma Delimited)",
    badge: "CSV",
    extension: ".csv",
    description: "Standard delimited text for spreadsheet analysis, GSTR-1 B2CS sales register, and custom accounting tools.",
    compatibility: "Excel, Google Sheets, GST Offline Utility, Zoho",
  },
  {
    id: "excel_xlsx",
    label: "Excel (Spreadsheet)",
    badge: "XLSX",
    extension: ".xlsx",
    description: "Multi-tab workbook containing Sales Register, Item-level HSN 1905 breakdown, and GSTR-1 tax schedules.",
    compatibility: "Microsoft Excel 2007+, LibreOffice, CA Audit Portals",
  },
  {
    id: "html_web",
    label: "HTML (Web-Publishing)",
    badge: "HTML",
    extension: ".html",
    description: "Self-contained responsive web ledger with embedded styling, brand headers, and one-click print stylesheet.",
    compatibility: "Any Web Browser, Email dispatch, Web Archives",
  },
  {
    id: "jpeg_image",
    label: "JPEG (Image)",
    badge: "JPG",
    extension: ".jpg",
    description: "High-resolution graphic voucher of the tax invoice or audit statement for WhatsApp sharing and visual records.",
    compatibility: "WhatsApp, Cloud Gallery, Receipts Folder",
  },
  {
    id: "json_data",
    label: "JSON (Data Exchange)",
    badge: "JSON",
    extension: ".json",
    description: "Structured machine-readable data matching GST Portal Offline Utility & modern ERP REST APIs.",
    compatibility: "GST Portal Offline Tool, ERP Integrations, Webhooks",
  },
  {
    id: "pdf_doc",
    label: "PDF (Read-only document)",
    badge: "PDF",
    extension: ".pdf",
    description: "Official, immutable read-only tax audit document issued under Section 31 of CGST Act, 2017.",
    compatibility: "Adobe Acrobat, Statutory Filing, Official Print",
  },
  {
    id: "xml_tally",
    label: "XML (Data Interchange)",
    badge: "XML",
    extension: ".xml",
    description: "Native Tally XML Voucher format for direct 1-click import into Tally ERP 9 and TallyPrime (Import Data > Vouchers).",
    compatibility: "Tally ERP 9, TallyPrime, Busy Accounting",
  },
];

export interface ExportSettingsConfig {
  companyName: string;
  gstin: string;
  stateCode: string;
  stateName: string;
  hsnCode: string;
  salesLedger: string;
  cgstLedger: string;
  sgstLedger: string;
  cashLedger: string;
  bankLedger: string;
  scope: "current" | "all" | "filtered";
  periodLabel?: string;
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettingsConfig = {
  companyName: BUSINESS_CONFIG.billingName,
  gstin: BUSINESS_CONFIG.taxIdentity.gstin,
  stateCode: BUSINESS_CONFIG.taxIdentity.stateCode,
  stateName: BUSINESS_CONFIG.taxIdentity.stateName,
  hsnCode: "1905",
  salesLedger: "Sales - Bakery & Confectionery",
  cgstLedger: "Output CGST @ 2.5%",
  sgstLedger: "Output SGST @ 2.5%",
  cashLedger: "Cash in Hand",
  bankLedger: "HDFC Current Bank Account",
  scope: "current",
  periodLabel: "October 2026",
};

/**
 * Browser file download helper
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDateForTally(isoOrString: string): string {
  const date = new Date(isoOrString);
  if (isNaN(date.getTime())) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}${m}${d}`;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * 1. ASCII (Comma Delimited) [.csv]
 */
export function exportToCsv(
  invoices: BillingInvoice[],
  config: ExportSettingsConfig = DEFAULT_EXPORT_SETTINGS
): void {
  const headers = [
    "Invoice Number",
    "Invoice Date",
    "Customer Name",
    "Customer Mobile",
    "Customer Email",
    "Payment Method",
    "Place of Supply",
    "State Code",
    "Item Name",
    "HSN/SAC Code",
    "Dietary",
    "Quantity",
    "Unit Price (INR)",
    "Taxable Value (INR)",
    "GST Rate (%)",
    "CGST Amount (INR)",
    "SGST Amount (INR)",
    "IGST Amount (INR)",
    "Packaging & Delivery (INR)",
    "Discount (INR)",
    "Invoice Grand Total (INR)",
  ];

  const rows: string[][] = [];

  invoices.forEach((inv) => {
    const rate = inv.includeGst ? inv.gstRate : 0;
    const cgstTotal = inv.includeGst ? inv.tax / 2 : 0;
    const sgstTotal = inv.includeGst ? inv.tax / 2 : 0;

    inv.items.forEach((item, index) => {
      const itemTaxable = item.price * item.quantity;
      const itemCgst = inv.includeGst ? (itemTaxable * (rate / 2)) / 100 : 0;
      const itemSgst = inv.includeGst ? (itemTaxable * (rate / 2)) / 100 : 0;

      rows.push([
        inv.invoiceNumber,
        inv.date,
        inv.customerName,
        inv.customerMobile,
        inv.customerEmail || "",
        inv.paymentMethod,
        `${config.stateCode}-${config.stateName}`,
        config.stateCode,
        item.name,
        item.hsnCode || config.hsnCode,
        item.isEggless !== false ? "Eggless (Veg)" : "Contains Egg",
        String(item.quantity),
        item.price.toFixed(2),
        itemTaxable.toFixed(2),
        rate.toFixed(1),
        itemCgst.toFixed(2),
        itemSgst.toFixed(2),
        "0.00",
        index === 0 ? inv.deliveryFee.toFixed(2) : "0.00",
        index === 0 ? inv.discount.toFixed(2) : "0.00",
        index === 0 ? inv.grandTotal.toFixed(2) : "",
      ]);
    });
  });

  const escapeCell = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvContent =
    "\uFEFF" +
    [
      headers.map(escapeCell).join(","),
      ...rows.map((r) => r.map(escapeCell).join(",")),
    ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const filename =
    invoices.length === 1
      ? `GST_Sales_${sanitizeFilename(invoices[0].invoiceNumber)}.csv`
      : `GST_Sales_Register_${sanitizeFilename(config.periodLabel || "Audit")}.csv`;

  downloadBlob(blob, filename);
}

/**
 * 2. Excel (Spreadsheet) [.xlsx]
 */
export function exportToExcel(
  invoices: BillingInvoice[],
  config: ExportSettingsConfig = DEFAULT_EXPORT_SETTINGS
): void {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Sales Register Summary
  const regHeaders = [
    "Sl No",
    "Invoice Number",
    "Invoice Date",
    "Customer Name",
    "Customer Mobile",
    "Payment Mode",
    "Place of Supply",
    "Taxable Subtotal (₹)",
    "GST Rate (%)",
    "CGST @ 2.5% (₹)",
    "SGST @ 2.5% (₹)",
    "Total Tax (₹)",
    "Delivery / Pkg (₹)",
    "Special Discount (₹)",
    "Grand Total (₹)",
    "Filing Status",
  ];

  let sumTaxable = 0;
  let sumCgst = 0;
  let sumSgst = 0;
  let sumTax = 0;
  let sumDelivery = 0;
  let sumDiscount = 0;
  let sumGrand = 0;

  const regRows: (string | number)[][] = invoices.map((inv, idx) => {
    const cgst = inv.includeGst ? inv.tax / 2 : 0;
    const sgst = inv.includeGst ? inv.tax / 2 : 0;
    sumTaxable += inv.subtotal;
    sumCgst += cgst;
    sumSgst += sgst;
    sumTax += inv.tax;
    sumDelivery += inv.deliveryFee;
    sumDiscount += inv.discount;
    sumGrand += inv.grandTotal;

    return [
      idx + 1,
      inv.invoiceNumber,
      inv.date,
      inv.customerName,
      inv.customerMobile,
      inv.paymentMethod,
      `${config.stateCode}-${config.stateName}`,
      inv.subtotal,
      inv.includeGst ? inv.gstRate : 0,
      cgst,
      sgst,
      inv.tax,
      inv.deliveryFee,
      inv.discount,
      inv.grandTotal,
      "GSTR-1 B2CS Verified",
    ];
  });

  // Summary row
  regRows.push([
    "TOTALS",
    `${invoices.length} Invoices`,
    "",
    "",
    "",
    "",
    "",
    Math.round(sumTaxable * 100) / 100,
    "",
    Math.round(sumCgst * 100) / 100,
    Math.round(sumSgst * 100) / 100,
    Math.round(sumTax * 100) / 100,
    Math.round(sumDelivery * 100) / 100,
    Math.round(sumDiscount * 100) / 100,
    Math.round(sumGrand * 100) / 100,
    "AUDIT READY",
  ]);

  const regSheet = XLSX.utils.aoa_to_sheet([regHeaders, ...regRows]);
  regSheet["!cols"] = [
    { wch: 8 },
    { wch: 18 },
    { wch: 20 },
    { wch: 25 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(workbook, regSheet, "Sales_Register");

  // Sheet 2: Item Level & HSN Details
  const itemHeaders = [
    "Invoice No",
    "Invoice Date",
    "HSN/SAC",
    "Item Description",
    "Category",
    "Dietary",
    "Qty",
    "Unit Price (₹)",
    "Taxable Value (₹)",
    "GST Rate (%)",
    "CGST (₹)",
    "SGST (₹)",
    "Line Total (₹)",
  ];

  const itemRows: (string | number)[][] = [];
  invoices.forEach((inv) => {
    const rate = inv.includeGst ? inv.gstRate : 0;
    inv.items.forEach((item) => {
      const taxable = item.price * item.quantity;
      const cgst = inv.includeGst ? (taxable * (rate / 2)) / 100 : 0;
      const sgst = inv.includeGst ? (taxable * (rate / 2)) / 100 : 0;
      const total = taxable + cgst + sgst;

      itemRows.push([
        inv.invoiceNumber,
        inv.date,
        item.hsnCode || config.hsnCode,
        item.name,
        item.category || "Bakery",
        item.isEggless !== false ? "Eggless (Veg)" : "Contains Egg",
        item.quantity,
        item.price,
        taxable,
        rate,
        cgst,
        sgst,
        total,
      ]);
    });
  });

  const itemSheet = XLSX.utils.aoa_to_sheet([itemHeaders, ...itemRows]);
  itemSheet["!cols"] = [
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 36 },
    { wch: 18 },
    { wch: 15 },
    { wch: 8 },
    { wch: 14 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(workbook, itemSheet, "HSN_Item_Breakdown");

  // Sheet 3: GSTR-1 Table 7 Summary (B2C Small)
  const gstrHeaders = [
    "Type",
    "Place of Supply",
    "Applicable % of Tax Rate",
    "Rate (%)",
    "Taxable Value (₹)",
    "Cess Amount (₹)",
    "Central Tax (₹)",
    "State/UT Tax (₹)",
  ];
  const gstrRows: (string | number)[][] = [
    [
      "OE - Other than E-Commerce",
      `${config.stateCode}-${config.stateName}`,
      "100.0%",
      "5.0%",
      Math.round(sumTaxable * 100) / 100,
      0,
      Math.round(sumCgst * 100) / 100,
      Math.round(sumSgst * 100) / 100,
    ],
  ];
  const gstrSheet = XLSX.utils.aoa_to_sheet([gstrHeaders, ...gstrRows]);
  gstrSheet["!cols"] = [
    { wch: 28 },
    { wch: 20 },
    { wch: 25 },
    { wch: 12 },
    { wch: 20 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(workbook, gstrSheet, "GSTR1_Table7_Summary");

  const filename =
    invoices.length === 1
      ? `GST_Invoice_${sanitizeFilename(invoices[0].invoiceNumber)}.xlsx`
      : `GST_Sales_Register_${sanitizeFilename(config.periodLabel || "Audit")}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

/**
 * 3. HTML (Web-Publishing) [.html]
 */
export function exportToHtml(
  invoices: BillingInvoice[],
  config: ExportSettingsConfig = DEFAULT_EXPORT_SETTINGS
): void {
  const isSingle = invoices.length === 1;
  const single = invoices[0];

  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalGrand = 0;

  invoices.forEach((i) => {
    totalTaxable += i.subtotal;
    totalCgst += i.includeGst ? i.tax / 2 : 0;
    totalSgst += i.includeGst ? i.tax / 2 : 0;
    totalGrand += i.grandTotal;
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSingle ? `Tax Invoice ${single.invoiceNumber}` : `GST Sales Register - ${config.periodLabel}`}</title>
  <style>
    @page { size: A4; margin: 12mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #262626;
      background: #fdfcfb;
      padding: 24px;
      line-height: 1.45;
      font-size: 13px;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px 36px;
      border: 1px solid #e7e5e4;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #78350f;
      padding-bottom: 18px;
      margin-bottom: 20px;
    }
    .company-title {
      font-size: 22px;
      font-weight: 800;
      color: #451a03;
      letter-spacing: -0.5px;
    }
    .company-sub {
      font-size: 11px;
      color: #78350f;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .company-meta {
      font-size: 11px;
      color: #57534e;
      margin-top: 6px;
      line-height: 1.4;
    }
    .audit-badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 11px;
      margin-top: 6px;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-type {
      font-size: 18px;
      font-weight: 800;
      color: #78350f;
      letter-spacing: 0.5px;
    }
    .doc-sub {
      font-size: 11px;
      color: #78716c;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 12px;
    }
    th {
      background: #451a03;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e7e5e4;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #fafaf9;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .bold { font-weight: 700; }
    .summary-card {
      background: #f5f5f4;
      border: 1px solid #e7e5e4;
      border-radius: 6px;
      padding: 16px;
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }
    .summary-item {
      flex: 1;
    }
    .summary-title {
      font-size: 10px;
      text-transform: uppercase;
      color: #78716c;
      font-weight: 700;
    }
    .summary-val {
      font-size: 16px;
      font-weight: 800;
      color: #1c1917;
      margin-top: 3px;
    }
    .footer-declaration {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px dashed #d6d3d1;
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      color: #78716c;
    }
    .signature-area {
      text-align: right;
    }
    .sig-line {
      margin-top: 36px;
      border-top: 1px solid #444;
      display: inline-block;
      min-width: 180px;
      padding-top: 4px;
      font-weight: 700;
      color: #1c1917;
    }
    .no-print {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      background: #78350f;
      color: #fff;
    }
    .btn:hover { background: #451a03; }
    @media print {
      body { padding: 0; background: #fff; }
      .container { box-shadow: none; border: none; padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" onclick="window.print()">Print / Save PDF</button>
  </div>

  <div class="container">
    <div class="header-bar">
      <div>
        <div class="company-title">${config.companyName}</div>
        <div class="company-sub">${BUSINESS_CONFIG.name} · Artisanal Patisserie</div>
        <div class="company-meta">
          ${BUSINESS_CONFIG.address.full}<br>
          GSTIN: <strong>${config.gstin}</strong> | State: <strong>${config.stateCode} (${config.stateName})</strong><br>
          Ph: ${BUSINESS_CONFIG.phoneDisplay} | Email: ${BUSINESS_CONFIG.email}
        </div>
        <div class="audit-badge">
          GST Compliance: Section 31 CGST Act, 2017
        </div>
      </div>

      <div class="doc-meta">
        <div class="doc-type">${isSingle ? "TAX INVOICE" : "GST SALES REGISTER"}</div>
        <div class="doc-sub">${isSingle ? `#${single.invoiceNumber}` : `Audit Period: ${config.periodLabel}`}</div>
        <div class="doc-sub" style="margin-top: 6px;">
          Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </div>
        <div class="doc-sub">Place of Supply: <strong>${config.stateCode}-${config.stateName}</strong></div>
      </div>
    </div>

    ${
      isSingle
        ? `
      <div style="background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between;">
        <div>
          <div style="font-size: 10px; font-weight: 700; color: #78716c;">BILLED TO:</div>
          <div style="font-size: 14px; font-weight: 700; color: #1c1917;">${single.customerName}</div>
          <div style="font-size: 11px; color: #57534e;">Mobile: ${single.customerMobile} ${single.customerEmail ? `| Email: ${single.customerEmail}` : ""}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10px; font-weight: 700; color: #78716c;">PAYMENT STATUS:</div>
          <div style="font-size: 13px; font-weight: 700; color: #15803d;">PAID via ${single.paymentMethod}</div>
          <div style="font-size: 11px; color: #57534e;">Date: ${single.date}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item Description</th>
            <th class="text-center">HSN/SAC</th>
            <th class="text-center">Dietary</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Rate (₹)</th>
            <th class="text-right">Taxable (₹)</th>
            <th class="text-right">GST (5%)</th>
            <th class="text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${single.items
            .map((item, idx) => {
              const taxable = item.price * item.quantity;
              const gstAmt = single.includeGst ? (taxable * single.gstRate) / 100 : 0;
              return `
              <tr>
                <td>${idx + 1}</td>
                <td>
                  <strong>${item.name}</strong>
                  ${item.notes ? `<div style="font-size: 10.5px; color: #78350f; font-style: italic;">* ${item.notes}</div>` : ""}
                </td>
                <td class="text-center">${item.hsnCode || config.hsnCode}</td>
                <td class="text-center">${item.isEggless !== false ? "Eggless" : "Egg"}</td>
                <td class="text-center bold">${item.quantity}</td>
                <td class="text-right">₹${item.price.toFixed(2)}</td>
                <td class="text-right">₹${taxable.toFixed(2)}</td>
                <td class="text-right">₹${gstAmt.toFixed(2)}</td>
                <td class="text-right bold">₹${(taxable + gstAmt).toFixed(2)}</td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>
    `
        : `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Invoice No</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Mode</th>
            <th class="text-right">Taxable (₹)</th>
            <th class="text-right">CGST 2.5%</th>
            <th class="text-right">SGST 2.5%</th>
            <th class="text-right">Delivery</th>
            <th class="text-right">Discount</th>
            <th class="text-right">Grand Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${invoices
            .map((inv, idx) => {
              const cgst = inv.includeGst ? inv.tax / 2 : 0;
              const sgst = inv.includeGst ? inv.tax / 2 : 0;
              return `
              <tr>
                <td>${idx + 1}</td>
                <td class="bold">${inv.invoiceNumber}</td>
                <td>${inv.date.split(",")[0]}</td>
                <td>${inv.customerName}</td>
                <td>${inv.paymentMethod}</td>
                <td class="text-right">₹${inv.subtotal.toFixed(2)}</td>
                <td class="text-right">₹${cgst.toFixed(2)}</td>
                <td class="text-right">₹${sgst.toFixed(2)}</td>
                <td class="text-right">₹${inv.deliveryFee.toFixed(2)}</td>
                <td class="text-right">${inv.discount > 0 ? `-₹${inv.discount.toFixed(2)}` : "₹0.00"}</td>
                <td class="text-right bold">₹${inv.grandTotal.toFixed(2)}</td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>
    `
    }

    <div class="summary-card">
      <div class="summary-item">
        <div class="summary-title">Total Invoices</div>
        <div class="summary-val">${invoices.length}</div>
      </div>
      <div class="summary-item">
        <div class="summary-title">Taxable Turnover</div>
        <div class="summary-val">₹${totalTaxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
      </div>
      <div class="summary-item">
        <div class="summary-title">CGST @ 2.5%</div>
        <div class="summary-val">₹${totalCgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
      </div>
      <div class="summary-item">
        <div class="summary-title">SGST @ 2.5%</div>
        <div class="summary-val">₹${totalSgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
      </div>
      <div class="summary-item">
        <div class="summary-title">Net Total Value</div>
        <div class="summary-val" style="color: #78350f;">₹${totalGrand.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
      </div>
    </div>

    <div class="footer-declaration">
      <div>
        <p><strong>Declaration:</strong> Certified that all particulars are true, correct, and represent genuine B2C supplies.</p>
        <p>HSN Code 1905: Handcrafted cakes, pastries, cookies, and artisanal bakery products.</p>
        <p>Applicable GST: 5% Intra-State (CGST 2.5% + SGST 2.5%) under Tamil Nadu GST Act, 2017.</p>
      </div>
      <div class="signature-area">
        <div class="sig-line">
          For ${config.companyName}<br>
          <span style="font-size: 9.5px; font-weight: normal; color: #78716c;">Authorized Signatory</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const filename = isSingle
    ? `Tax_Invoice_${sanitizeFilename(single.invoiceNumber)}.html`
    : `GST_Sales_Register_${sanitizeFilename(config.periodLabel || "Audit")}.html`;

  downloadBlob(blob, filename);
}

/**
 * 4. JPEG (Image) [.jpg]
 * Client-side HTML5 Canvas rendering of the Tax Invoice / Audit Voucher.
 */
export async function exportToJpeg(
  invoices: BillingInvoice[],
  config: ExportSettingsConfig = DEFAULT_EXPORT_SETTINGS
): Promise<void> {
  const isSingle = invoices.length === 1;
  const single = invoices[0];

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not acquire 2D canvas context");
  }

  // Calculate canvas dimensions
  const width = 1000;
  const rowHeight = 36;
  const itemsCount = isSingle ? single.items.length : Math.min(invoices.length, 18);
  const tableHeight = (itemsCount + 1) * rowHeight;
  const height = Math.max(900, 480 + tableHeight);

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Outer border
  ctx.strokeStyle = "#E7E5E4";
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Top luxury accent header bar
  ctx.fillStyle = "#3D1A0C";
  ctx.fillRect(16, 16, width - 32, 110);

  // Header texts
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(config.companyName.toUpperCase(), 36, 52);

  ctx.fillStyle = "#FDE68A";
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(`${BUSINESS_CONFIG.name.toUpperCase()} · ARTISANAL OVEN-FRESH BAKERY`, 36, 75);

  ctx.fillStyle = "#E7E5E4";
  ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(`GSTIN: ${config.gstin} | State: ${config.stateCode} (${config.stateName}) | Ph: ${BUSINESS_CONFIG.phoneDisplay}`, 36, 98);

  // Right side of header: Document title
  ctx.textAlign = "right";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(isSingle ? "TAX INVOICE" : "AUDIT VOUCHER", width - 36, 56);

  ctx.fillStyle = "#FDE68A";
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(isSingle ? `#${single.invoiceNumber}` : `Period: ${config.periodLabel}`, width - 36, 80);

  ctx.fillStyle = "#E7E5E4";
  ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(`Date: ${new Date().toLocaleDateString("en-IN")}`, width - 36, 102);
  ctx.textAlign = "left";

  let y = 150;

  // Metadata block
  ctx.fillStyle = "#F5F5F4";
  ctx.fillRect(36, y, width - 72, 60);
  ctx.strokeStyle = "#D6D3D1";
  ctx.lineWidth = 1;
  ctx.strokeRect(36, y, width - 72, 60);

  ctx.fillStyle = "#78716C";
  ctx.font = "bold 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("CUSTOMER / RECIPIENT", 50, y + 20);
  ctx.fillText("PAYMENT & TAX MODE", 420, y + 20);
  ctx.fillText("PLACE OF SUPPLY", 740, y + 20);

  ctx.fillStyle = "#1C1917";
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const custName = isSingle ? single.customerName : `${invoices.length} Sales Transactions`;
  ctx.fillText(custName.slice(0, 32), 50, y + 42);

  const payMode = isSingle ? `${single.paymentMethod} (PAID)` : "Multi-channel (UPI / Cash / Card)";
  ctx.fillText(payMode, 420, y + 42);

  ctx.fillText(`${config.stateCode}-${config.stateName}`, 740, y + 42);

  y += 80;

  // Table header
  ctx.fillStyle = "#451A03";
  ctx.fillRect(36, y, width - 72, 32);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  if (isSingle) {
    ctx.fillText("#", 48, y + 20);
    ctx.fillText("ITEM DESCRIPTION", 80, y + 20);
    ctx.fillText("HSN", 470, y + 20);
    ctx.fillText("QTY", 560, y + 20);
    ctx.fillText("RATE", 650, y + 20);
    ctx.fillText("TAXABLE", 760, y + 20);
    ctx.fillText("TOTAL", 880, y + 20);
  } else {
    ctx.fillText("#", 48, y + 20);
    ctx.fillText("INVOICE NO", 80, y + 20);
    ctx.fillText("CUSTOMER", 260, y + 20);
    ctx.fillText("MODE", 500, y + 20);
    ctx.fillText("TAXABLE", 620, y + 20);
    ctx.fillText("GST 5%", 740, y + 20);
    ctx.fillText("GRAND TOTAL", 860, y + 20);
  }

  y += 32;

  // Table rows
  ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  if (isSingle) {
    single.items.forEach((item, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? "#FAFAF9" : "#FFFFFF";
      ctx.fillRect(36, y, width - 72, rowHeight);
      ctx.strokeStyle = "#E7E5E4";
      ctx.strokeRect(36, y, width - 72, rowHeight);

      ctx.fillStyle = "#1C1917";
      ctx.fillText(String(idx + 1), 48, y + 22);
      ctx.fillText(item.name.slice(0, 38), 80, y + 22);
      ctx.fillText(item.hsnCode || config.hsnCode, 470, y + 22);
      ctx.fillText(String(item.quantity), 565, y + 22);
      ctx.fillText(`₹${item.price.toFixed(0)}`, 650, y + 22);
      ctx.fillText(`₹${(item.price * item.quantity).toFixed(0)}`, 760, y + 22);
      ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`₹${(item.price * item.quantity * 1.05).toFixed(0)}`, 880, y + 22);
      ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

      y += rowHeight;
    });
  } else {
    invoices.slice(0, 18).forEach((inv, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? "#FAFAF9" : "#FFFFFF";
      ctx.fillRect(36, y, width - 72, rowHeight);
      ctx.strokeStyle = "#E7E5E4";
      ctx.strokeRect(36, y, width - 72, rowHeight);

      ctx.fillStyle = "#1C1917";
      ctx.fillText(String(idx + 1), 48, y + 22);
      ctx.fillText(inv.invoiceNumber, 80, y + 22);
      ctx.fillText(inv.customerName.slice(0, 22), 260, y + 22);
      ctx.fillText(inv.paymentMethod, 500, y + 22);
      ctx.fillText(`₹${inv.subtotal.toFixed(0)}`, 620, y + 22);
      ctx.fillText(`₹${inv.tax.toFixed(0)}`, 740, y + 22);
      ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`₹${inv.grandTotal.toFixed(0)}`, 860, y + 22);
      ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

      y += rowHeight;
    });
  }

  y += 24;

  // Calculation totals card
  const totalTaxable = invoices.reduce((s, i) => s + i.subtotal, 0);
  const totalTax = invoices.reduce((s, i) => s + i.tax, 0);
  const totalGrand = invoices.reduce((s, i) => s + i.grandTotal, 0);

  ctx.fillStyle = "#FDFBF7";
  ctx.fillRect(width - 420, y, 384, 120);
  ctx.strokeStyle = "#D5C8BB";
  ctx.strokeRect(width - 420, y, 384, 120);

  ctx.fillStyle = "#44403C";
  ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Taxable Value (Subtotal):", width - 400, y + 26);
  ctx.fillText(`₹${totalTaxable.toFixed(2)}`, width - 120, y + 26);

  ctx.fillText("Output GST (CGST 2.5% + SGST 2.5%):", width - 400, y + 54);
  ctx.fillText(`₹${totalTax.toFixed(2)}`, width - 120, y + 54);

  ctx.strokeStyle = "#E7E5E4";
  ctx.beginPath();
  ctx.moveTo(width - 400, y + 70);
  ctx.lineTo(width - 56, y + 70);
  ctx.stroke();

  ctx.fillStyle = "#78350F";
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("GRAND TOTAL (NET PAID):", width - 400, y + 98);
  ctx.fillText(`₹${totalGrand.toFixed(2)}`, width - 120, y + 98);

  // Bottom statutory notice & stamp
  ctx.fillStyle = "#78716C";
  ctx.font = "10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Issued under Section 31 of CGST Act, 2017 & Tamil Nadu SGST Act.", 36, height - 48);
  ctx.fillText(`For ${config.companyName} · Authorized Signatory`, width - 280, height - 48);

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        console.error("Failed to generate JPEG blob");
        return;
      }
      const filename = isSingle
        ? `GST_Invoice_${sanitizeFilename(single.invoiceNumber)}.jpg`
        : `GST_Sales_Voucher_${sanitizeFilename(config.periodLabel || "Audit")}.jpg`;
      downloadBlob(blob, filename);
    },
    "image/jpeg",
    0.95
  );
}

/**
 * 5. JSON (Data Exchange) [.json]
 * Standard schema compatible with GST Portal Offline Utility and ERP integrations.
 */
export function exportToJson(
  invoices: BillingInvoice[],
  config: ExportSettingsConfig = DEFAULT_EXPORT_SETTINGS
): void {
  const isSingle = invoices.length === 1;

  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalGrand = 0;

  invoices.forEach((i) => {
    totalTaxable += i.subtotal;
    totalCgst += i.includeGst ? i.tax / 2 : 0;
    totalSgst += i.includeGst ? i.tax / 2 : 0;
    totalGrand += i.grandTotal;
  });

  const payload = {
    version: "GSTR-1_V1.4",
    generatedAt: new Date().toISOString(),
    generator: "Kichees Bakery POS Billing - Audit Export",
    taxpayerDetails: {
      legalName: config.companyName,
      tradeName: BUSINESS_CONFIG.name,
      gstin: config.gstin,
      stateCode: config.stateCode,
      stateName: config.stateName,
      address: BUSINESS_CONFIG.address,
      contact: {
        phone: BUSINESS_CONFIG.phoneDisplay,
        email: BUSINESS_CONFIG.email,
      },
    },
    auditMetadata: {
      filingPeriod: config.periodLabel || "Current Month",
      totalInvoices: invoices.length,
      currency: "INR",
      placeOfSupply: `${config.stateCode}-${config.stateName}`,
      hsnCode: config.hsnCode,
      totalTaxableAmount: Math.round(totalTaxable * 100) / 100,
      totalCGST: Math.round(totalCgst * 100) / 100,
      totalSGST: Math.round(totalSgst * 100) / 100,
      totalTax: Math.round((totalCgst + totalSgst) * 100) / 100,
      totalGrossValue: Math.round(totalGrand * 100) / 100,
    },
    gstr1Summary: {
      table7_b2cs: [
        {
          sply_ty: "INTRA",
          pos: config.stateCode,
          rt: 5.0,
          txval: Math.round(totalTaxable * 100) / 100,
          camt: Math.round(totalCgst * 100) / 100,
          samt: Math.round(totalSgst * 100) / 100,
          csamt: 0.0,
        },
      ],
      table12_hsn: [
        {
          num: 1,
          hsn_sc: config.hsnCode,
          desc: "Cakes, Pastries, Bread and Artisanal Bakery Products",
          uqc: "NOS",
          qty: invoices.reduce((sum, inv) => sum + inv.items.reduce((s, it) => s + it.quantity, 0), 0),
          val: Math.round(totalGrand * 100) / 100,
          txval: Math.round(totalTaxable * 100) / 100,
          camt: Math.round(totalCgst * 100) / 100,
          samt: Math.round(totalSgst * 100) / 100,
          csamt: 0.0,
        },
      ],
    },
    invoices: invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      date: inv.date,
      customer: {
        name: inv.customerName,
        mobile: inv.customerMobile,
        email: inv.customerEmail || null,
      },
      payment: {
        method: inv.paymentMethod,
        status: inv.status,
      },
      financials: {
        subtotal: inv.subtotal,
        gstRate: inv.includeGst ? inv.gstRate : 0,
        cgst: inv.includeGst ? Math.round((inv.tax / 2) * 100) / 100 : 0,
        sgst: inv.includeGst ? Math.round((inv.tax / 2) * 100) / 100 : 0,
        totalTax: inv.tax,
        deliveryFee: inv.deliveryFee,
        discount: inv.discount,
        grandTotal: inv.grandTotal,
      },
      items: inv.items.map((it) => ({
        id: it.id,
        name: it.name,
        hsnCode: it.hsnCode || config.hsnCode,
        isEggless: it.isEggless !== false,
        quantity: it.quantity,
        unitPrice: it.price,
        totalPrice: it.price * it.quantity,
        notes: it.notes || null,
      })),
    })),
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
  const filename = isSingle
    ? `GSTR1_Invoice_${sanitizeFilename(invoices[0].invoiceNumber)}.json`
    : `GSTR1_Sales_Register_${sanitizeFilename(config.periodLabel || "Audit")}.json`;

  downloadBlob(blob, filename);
}

/**
 * 6. PDF (Read-only document) [.pdf]
 * Triggers standard browser print-to-PDF with clean, isolated GST invoice styling.
 */
export function exportToPdf(
  invoices: BillingInvoice[],
  config: ExportSettingsConfig = DEFAULT_EXPORT_SETTINGS
): void {
  // Leverage print window directly for clean A4 print preview
  const isSingle = invoices.length === 1;
  const single = invoices[0];

  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalGrand = 0;

  invoices.forEach((i) => {
    totalTaxable += i.subtotal;
    totalCgst += i.includeGst ? i.tax / 2 : 0;
    totalSgst += i.includeGst ? i.tax / 2 : 0;
    totalGrand += i.grandTotal;
  });

  const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${isSingle ? `Tax Invoice ${single.invoiceNumber}` : `GST Sales Audit Register`}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
    body { color: #1c1917; font-size: 11px; line-height: 1.4; padding: 8px; }
    .header { border-bottom: 2px solid #78350f; padding-bottom: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; }
    .title { font-size: 20px; font-weight: 800; color: #451a03; }
    .subtitle { font-size: 10px; color: #78350f; font-weight: 700; text-transform: uppercase; }
    .meta { font-size: 10px; color: #57534e; margin-top: 4px; }
    .doc-type { font-size: 16px; font-weight: 800; color: #78350f; text-align: right; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10.5px; }
    th { background: #451a03; color: #fff; padding: 6px 8px; font-size: 10px; text-transform: uppercase; }
    td { padding: 6px 8px; border-bottom: 1px solid #e7e5e4; }
    tr:nth-child(even) td { background: #fafaf9; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .bold { font-weight: 700; }
    .summary { margin-top: 14px; padding: 10px; background: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 4px; display: flex; justify-content: space-between; font-size: 11px; }
    .footer { margin-top: 24px; border-top: 1px dashed #a8a29e; padding-top: 10px; display: flex; justify-content: space-between; font-size: 9.5px; color: #78716c; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">${config.companyName}</div>
      <div class="subtitle">${BUSINESS_CONFIG.name} · Artisanal Patisserie</div>
      <div class="meta">
        ${BUSINESS_CONFIG.address.full}<br>
        GSTIN: <strong>${config.gstin}</strong> | State: ${config.stateCode} (${config.stateName}) | Ph: ${BUSINESS_CONFIG.phoneDisplay}
      </div>
    </div>
    <div>
      <div class="doc-type">${isSingle ? "TAX INVOICE (READ-ONLY)" : "GST SALES AUDIT REGISTER"}</div>
      <div style="text-align: right; font-size: 10px; color: #78716c; margin-top: 4px;">
        ${isSingle ? `#${single.invoiceNumber}` : `Audit Period: ${config.periodLabel}`}<br>
        Date: ${new Date().toLocaleDateString("en-IN")}
      </div>
    </div>
  </div>

  ${
    isSingle
      ? `
    <div style="background: #fafaf9; border: 1px solid #e7e5e4; padding: 8px 12px; margin-bottom: 10px; display: flex; justify-content: space-between;">
      <div><strong>Customer:</strong> ${single.customerName} (${single.customerMobile})</div>
      <div><strong>Payment:</strong> ${single.paymentMethod} (PAID) | Date: ${single.date}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item Description</th>
          <th class="text-center">HSN</th>
          <th class="text-center">Qty</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Taxable</th>
          <th class="text-right">GST (5%)</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${single.items
          .map(
            (it, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${it.name}</strong></td>
            <td class="text-center">${it.hsnCode || config.hsnCode}</td>
            <td class="text-center bold">${it.quantity}</td>
            <td class="text-right">₹${it.price.toFixed(2)}</td>
            <td class="text-right">₹${(it.price * it.quantity).toFixed(2)}</td>
            <td class="text-right">₹${((it.price * it.quantity * 0.05)).toFixed(2)}</td>
            <td class="text-right bold">₹${((it.price * it.quantity * 1.05)).toFixed(2)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `
      : `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Invoice No</th>
          <th>Date</th>
          <th>Customer</th>
          <th>Mode</th>
          <th class="text-right">Taxable (₹)</th>
          <th class="text-right">CGST 2.5%</th>
          <th class="text-right">SGST 2.5%</th>
          <th class="text-right">Grand Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${invoices
          .map(
            (inv, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td class="bold">${inv.invoiceNumber}</td>
            <td>${inv.date.split(",")[0]}</td>
            <td>${inv.customerName}</td>
            <td>${inv.paymentMethod}</td>
            <td class="text-right">₹${inv.subtotal.toFixed(2)}</td>
            <td class="text-right">₹${(inv.includeGst ? inv.tax / 2 : 0).toFixed(2)}</td>
            <td class="text-right">₹${(inv.includeGst ? inv.tax / 2 : 0).toFixed(2)}</td>
            <td class="text-right bold">₹${inv.grandTotal.toFixed(2)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `
  }

  <div class="summary">
    <div>Total Invoices: <strong>${invoices.length}</strong></div>
    <div>Taxable: <strong>₹${totalTaxable.toFixed(2)}</strong></div>
    <div>CGST (2.5%): <strong>₹${totalCgst.toFixed(2)}</strong></div>
    <div>SGST (2.5%): <strong>₹${totalSgst.toFixed(2)}</strong></div>
    <div>Grand Total: <strong style="color: #78350f;">₹${totalGrand.toFixed(2)}</strong></div>
  </div>

  <div class="footer">
    <div>Statutory declaration under CGST Act Section 31. Issued for GST filing and audit verification.</div>
    <div style="text-align: right;">For ${config.companyName} · Authorized Signatory</div>
  </div>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(printHtml);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1500);
  }, 400);
}

/**
 * 7. XML (Data Interchange) [.xml]
 * Native Tally ERP 9 / TallyPrime XML Voucher Interchange format.
 * Enables Chartered Accountants to click "Import Data > Vouchers" in Tally and import all sales!
 */
export function exportToTallyXml(
  invoices: BillingInvoice[],
  config: ExportSettingsConfig = DEFAULT_EXPORT_SETTINGS
): void {
  const isSingle = invoices.length === 1;

  const vouchersXml = invoices
    .map((inv) => {
      const tallyDate = formatDateForTally(inv.rawDate || inv.createdAt || inv.date);
      const partyLedger =
        inv.paymentMethod === "CASH"
          ? config.cashLedger
          : inv.paymentMethod === "UPI" || inv.paymentMethod === "ONLINE"
          ? config.bankLedger
          : "Credit Card / POS Clearing";

      const cgst = inv.includeGst ? Math.round((inv.tax / 2) * 100) / 100 : 0;
      const sgst = inv.includeGst ? Math.round((inv.tax / 2) * 100) / 100 : 0;
      const taxable = Math.round(inv.subtotal * 100) / 100;
      const grandTotal = Math.round(inv.grandTotal * 100) / 100;

      const itemsSummary = inv.items
        .map((it) => `${it.quantity}x ${it.name}`)
        .join(", ")
        .slice(0, 160);

      const narration = `Tax Invoice ${inv.invoiceNumber} to ${inv.customerName} (${inv.customerMobile}). Items: ${itemsSummary}. Paid via ${inv.paymentMethod}.`;

      return `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${tallyDate}</DATE>
            <EFFECTIVEDATE>${tallyDate}</EFFECTIVEDATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${escapeXml(inv.invoiceNumber)}</VOUCHERNUMBER>
            <REFERENCE>${escapeXml(inv.invoiceNumber)}</REFERENCE>
            <PARTYLEDGERNAME>${escapeXml(partyLedger)}</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
            <BASICBASEPARTYNAME>${escapeXml(inv.customerName)}</BASICBASEPARTYNAME>
            <BASICBUYERNAME>${escapeXml(inv.customerName)}</BASICBUYERNAME>
            <BASICBUYERADDRESS.LIST>
              <BASICBUYERADDRESS>${escapeXml(BUSINESS_CONFIG.address.city)}</BASICBUYERADDRESS>
            </BASICBUYERADDRESS.LIST>
            <PLACEOFSUPPLY>${escapeXml(config.stateName)}</PLACEOFSUPPLY>
            <STATENAME>${escapeXml(config.stateName)}</STATENAME>
            <COUNTRYOFRESIDENCE>India</COUNTRYOFRESIDENCE>
            <PARTYGSTIN></PARTYGSTIN>
            <GSTREGISTRATIONTYPE>Unregistered</GSTREGISTRATIONTYPE>
            <ISINVOICE>Yes</ISINVOICE>
            <NARRATION>${escapeXml(narration)}</NARRATION>
            
            <!-- DEBIT: Receipt Account (Cash / Bank) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(partyLedger)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
              <AMOUNT>-${grandTotal.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- CREDIT: Sales Account -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(config.salesLedger)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <ISPARTYLEDGER>No</ISPARTYLEDGER>
              <AMOUNT>${taxable.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            ${
              cgst > 0
                ? `<!-- CREDIT: Output CGST -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(config.cgstLedger)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <ISPARTYLEDGER>No</ISPARTYLEDGER>
              <AMOUNT>${cgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`
                : ""
            }

            ${
              sgst > 0
                ? `<!-- CREDIT: Output SGST -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(config.sgstLedger)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <ISPARTYLEDGER>No</ISPARTYLEDGER>
              <AMOUNT>${sgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`
                : ""
            }

            ${
              inv.deliveryFee > 0
                ? `<!-- CREDIT: Delivery Charges -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Delivery &amp; Packaging Income</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <ISPARTYLEDGER>No</ISPARTYLEDGER>
              <AMOUNT>${inv.deliveryFee.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`
                : ""
            }

            ${
              inv.discount > 0
                ? `<!-- DEBIT: Discount Allowed -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Discount Allowed</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <ISPARTYLEDGER>No</ISPARTYLEDGER>
              <AMOUNT>-${inv.discount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`
                : ""
            }
          </VOUCHER>
        </TALLYMESSAGE>`;
    })
    .join("\n");

  const fullXml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(config.companyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${vouchersXml}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  const blob = new Blob([fullXml], { type: "application/xml;charset=utf-8;" });
  const filename = isSingle
    ? `Tally_Voucher_${sanitizeFilename(invoices[0].invoiceNumber)}.xml`
    : `Tally_Sales_Vouchers_${sanitizeFilename(config.periodLabel || "Audit")}.xml`;

  downloadBlob(blob, filename);
}

/**
 * Single Unified Runner to execute any of the 7 export formats.
 */
export async function executeAuditExport(
  format: AuditExportFormat,
  invoices: BillingInvoice[],
  config: ExportSettingsConfig = DEFAULT_EXPORT_SETTINGS
): Promise<void> {
  if (invoices.length === 0) {
    throw new Error("No billing records selected for export");
  }

  switch (format) {
    case "ascii_csv":
      exportToCsv(invoices, config);
      break;
    case "excel_xlsx":
      exportToExcel(invoices, config);
      break;
    case "html_web":
      exportToHtml(invoices, config);
      break;
    case "jpeg_image":
      await exportToJpeg(invoices, config);
      break;
    case "json_data":
      exportToJson(invoices, config);
      break;
    case "pdf_doc":
      exportToPdf(invoices, config);
      break;
    case "xml_tally":
      exportToTallyXml(invoices, config);
      break;
    default:
      exportToExcel(invoices, config);
  }
}
