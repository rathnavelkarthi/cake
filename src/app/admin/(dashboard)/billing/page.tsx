"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Search,
  RotateCcw,
  Sparkles,
  Share2,
  ShoppingBag,
  Edit2,
  FileText,
  User,
  Phone,
  Percent,
  Truck,
  MessageCircle,
  Cake,
  Check,
  Eye,
  X,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getInventoryProducts,
  subscribeInventory,
  AdminProductItem,
} from "@/lib/db/admin-data";
import { BUSINESS_CONFIG } from "@/lib/config/business";

/**
 * The single place invoices read business identity from.
 *
 * Previously the GSTIN, FSSAI number, both outlet addresses and the phone
 * numbers were typed inline in three separate blocks, so they drifted apart and
 * two of them were placeholders. Changing a detail here updates every bill.
 */
const BILLING_IDENTITY = {
  address: BUSINESS_CONFIG.address.full,
  gstin: BUSINESS_CONFIG.taxIdentity.gstin,
  stateCode: BUSINESS_CONFIG.taxIdentity.stateCode,
  stateName: BUSINESS_CONFIG.taxIdentity.stateName,
  phone: `${BUSINESS_CONFIG.phoneDisplay} / ${BUSINESS_CONFIG.whatsappDisplay}`,
  email: BUSINESS_CONFIG.email,
} as const;

interface BillItem {
  id: string;
  name: string;
  originalPrice: number;
  price: number;
  quantity: number;
  isCustom?: boolean;
  notes?: string;
  isEggless?: boolean;
  category?: string;
}

interface InvoicePrintData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerMobile: string;
  paymentMethod: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  includeGst: boolean;
  gstRate: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  format: "a4" | "thermal";
}

// Convert number to Indian Rupees in words
function numberToWords(amount: number): string {
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const num = Math.floor(amount);
  if (num === 0) return "Zero Rupees Only";

  const convertLessThanOneThousand = (n: number): string => {
    let str = "";
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += units[n] + " ";
    }
    return str.trim();
  };

  let result = "";
  let n = num;

  if (n >= 10000000) {
    result += convertLessThanOneThousand(Math.floor(n / 10000000)) + " Crore ";
    n %= 10000000;
  }
  if (n >= 100000) {
    result += convertLessThanOneThousand(Math.floor(n / 100000)) + " Lakh ";
    n %= 100000;
  }
  if (n >= 1000) {
    result += convertLessThanOneThousand(Math.floor(n / 1000)) + " Thousand ";
    n %= 1000;
  }
  if (n > 0) {
    result += convertLessThanOneThousand(n) + " ";
  }

  return `Rupees ${result.trim()} Only`;
}

// Generates pure, isolated invoice HTML for direct PDF export and printing (Zero website UI)
function generateInvoiceHtml(data: InvoicePrintData): string {
  const isThermal = data.format === "thermal";

  if (isThermal) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${data.invoiceNumber}</title>
  <style>
    @page { size: 80mm auto; margin: 3mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Courier New', monospace, -apple-system; }
    body { width: 72mm; margin: 0 auto; color: #000; font-size: 11px; line-height: 1.35; padding: 4px 0; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 5px 0; }
    .double-divider { border-top: 2px dashed #000; margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; margin: 4px 0; }
    th { text-align: left; font-size: 10px; border-bottom: 1px dashed #000; padding: 2px 0; }
    td { font-size: 10.5px; padding: 2.5px 0; vertical-align: top; }
    .item-title { font-weight: bold; }
    .item-sub { font-size: 9.5px; color: #333; }
    .total-row td { font-size: 13px; font-weight: bold; padding: 4px 0; }
    .footer { font-size: 9.5px; text-align: center; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="text-center">
    <div style="font-size: 15px; font-weight: bold; letter-spacing: 0.5px;">KICHEE'S BAKED DELIGHTS</div>
    <div style="font-size: 9.5px;">Artisanal Cakes & Patisserie</div>
    <div style="font-size: 9px; margin-top: 2px;">${BILLING_IDENTITY.address}</div>
    <div style="font-size: 9px;">GSTIN: ${BILLING_IDENTITY.gstin}</div>
    <div style="font-size: 9px;">Ph: ${BILLING_IDENTITY.phone}</div>
  </div>

  <div class="divider"></div>

  <div>
    <div><strong>Bill No:</strong> ${data.invoiceNumber}</div>
    <div><strong>Date:</strong> ${data.date}</div>
    <div><strong>Customer:</strong> ${data.customerName}</div>
    <div><strong>Mobile:</strong> ${data.customerMobile}</div>
    <div><strong>Payment:</strong> ${data.paymentMethod} (PAID)</div>
  </div>

  <div class="divider"></div>

  <table>
    <thead>
      <tr>
        <th style="width: 46%;">Item</th>
        <th class="text-center" style="width: 14%;">Qty</th>
        <th class="text-right" style="width: 20%;">Rate</th>
        <th class="text-right" style="width: 20%;">Amt</th>
      </tr>
    </thead>
    <tbody>
      ${data.items
        .map(
          (item) => `
        <tr>
          <td>
            <div class="item-title">${item.name}</div>
            <div class="item-sub">${item.isEggless !== false ? "[VEG]" : "[CONTAINS EGG]"}</div>
            ${item.notes ? `<div class="item-sub" style="font-style: italic;">* ${item.notes}</div>` : ""}
          </td>
          <td class="text-center bold">${item.quantity}</td>
          <td class="text-right">${item.price}</td>
          <td class="text-right bold">${item.price * item.quantity}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="divider"></div>

  <table style="margin: 0;">
    <tr>
      <td>Subtotal:</td>
      <td class="text-right">₹${data.subtotal.toLocaleString("en-IN")}</td>
    </tr>
    ${
      data.includeGst && data.gstRate > 0
        ? `
      <tr>
        <td>CGST (${(data.gstRate / 2).toFixed(1)}%):</td>
        <td class="text-right">₹${(data.tax / 2).toFixed(2)}</td>
      </tr>
      <tr>
        <td>SGST (${(data.gstRate / 2).toFixed(1)}%):</td>
        <td class="text-right">₹${(data.tax / 2).toFixed(2)}</td>
      </tr>`
        : `<tr><td>GST:</td><td class="text-right">${data.includeGst ? "0% (Exempt)" : "Included"}</td></tr>`
    }
    ${
      data.deliveryFee > 0
        ? `<tr><td>Delivery / Packaging:</td><td class="text-right">+₹${data.deliveryFee}</td></tr>`
        : ""
    }
    ${
      data.discount > 0
        ? `<tr><td>Discount / Rebate:</td><td class="text-right">-₹${data.discount}</td></tr>`
        : ""
    }
    <tr class="total-row">
      <td style="border-top: 1px dashed #000; padding-top: 4px;">NET TOTAL:</td>
      <td class="text-right" style="border-top: 1px dashed #000; padding-top: 4px;">₹${data.grandTotal.toLocaleString("en-IN")}</td>
    </tr>
  </table>

  <div class="double-divider"></div>

  <div class="footer">
    <div class="bold">Thank you for visiting Kichee's!</div>
    <div>Perishable bakery items. Store refrigerated below 5°C.</div>
    <div>Follow us on Instagram: @kicheesdelights</div>
  </div>
</body>
</html>`;
  }

  // Formal A4 Tax Invoice
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tax Invoice - ${data.invoiceNumber}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #1f1714;
      background: #fff;
      font-size: 12.5px;
      line-height: 1.45;
      padding: 10px;
    }
    .invoice-card {
      max-width: 820px;
      margin: 0 auto;
      border: 1px solid #dcd3c8;
      border-radius: 8px;
      padding: 28px 32px;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #3a2016;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .brand-subtitle { font-size: 11px; color: #8c7365; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .brand-address { font-size: 11px; color: #555; margin-top: 4px; line-height: 1.4; }
    .tax-badge {
      display: inline-block;
      background: #fdf5ef;
      border: 1px solid #ecc9b3;
      color: #7b3211;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10.5px;
      font-weight: bold;
    }
    .invoice-title-col { text-align: right; vertical-align: top; }
    .invoice-heading { font-size: 20px; font-weight: 800; color: #7b3211; letter-spacing: 0.5px; }
    
    .meta-box {
      width: 100%;
      border: 1px solid #ede4d9;
      background: #faf6f1;
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 20px;
    }
    .meta-table { width: 100%; border-collapse: collapse; }
    .meta-table td { padding: 3px 6px; font-size: 11.5px; vertical-align: top; }
    .meta-label { color: #6e625a; font-weight: 600; width: 18%; }
    .meta-val { color: #1f1714; font-weight: 700; width: 32%; }

    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    .items-table th {
      background: #3a2016;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      border: 1px solid #3a2016;
    }
    .items-table td {
      padding: 9px 10px;
      font-size: 12px;
      border: 1px solid #e8dfd5;
      vertical-align: top;
    }
    .items-table tbody tr:nth-child(even) { background-color: #faf7f2; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .diet-badge {
      display: inline-block;
      font-size: 9.5px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .diet-veg { background: #e8f5e9; color: #1b5e20; border: 1px solid #a5d6a7; }
    .diet-nonveg { background: #fbe9e7; color: #b71c1c; border: 1px solid #ffccbc; }
    .item-notes { font-size: 10.5px; color: #7b3211; font-style: italic; margin-top: 3px; }

    .summary-section { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .words-col { width: 55%; vertical-align: top; padding-right: 20px; }
    .totals-col { width: 45%; vertical-align: top; }
    
    .totals-table { width: 100%; border-collapse: collapse; }
    .totals-table td { padding: 4px 6px; font-size: 12px; }
    .grand-total-row {
      background: #fdf5ef;
      border-top: 2px solid #7b3211;
      border-bottom: 2px solid #7b3211;
    }
    .grand-total-row td {
      font-size: 15px;
      font-weight: 800;
      color: #7b3211;
      padding: 8px 6px;
    }
    .words-box {
      border: 1px dashed #d5c8bb;
      background: #faf6f1;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 11px;
      color: #4a3e36;
      line-height: 1.4;
    }

    .footer-section {
      border-top: 1px solid #e0d7cd;
      padding-top: 16px;
      display: table;
      width: 100%;
    }
    .terms-col { display: table-cell; width: 65%; font-size: 10px; color: #666; line-height: 1.4; vertical-align: bottom; }
    .signature-col { display: table-cell; width: 35%; text-align: right; vertical-align: bottom; }
    .sign-space { height: 40px; }
    .sign-line { font-weight: bold; font-size: 11px; color: #3a2016; border-top: 1px solid #888; padding-top: 4px; display: inline-block; min-width: 160px; text-align: center; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <!-- Header -->
    <table class="header-table">
      <tr>
        <td style="width: 62%;">
          <div class="brand-title">Kichee's Baked Delights</div>
          <div class="brand-subtitle">Artisanal Patisserie & Bespoke Cake Studio</div>
          <div class="brand-address">
            <strong>Address:</strong> ${BILLING_IDENTITY.address}<br>
            <strong>Phone:</strong> ${BILLING_IDENTITY.phone} | <strong>Email:</strong> ${BILLING_IDENTITY.email}
          </div>
          <div style="margin-top: 6px;">
            <span class="tax-badge">GSTIN: ${BILLING_IDENTITY.gstin}</span>
          </div>
        </td>
        <td class="invoice-title-col">
          <div class="invoice-heading">TAX INVOICE</div>
          <div style="font-size: 11px; color: #666; margin-top: 3px;">Original for Recipient</div>
          <div style="font-size: 14px; font-weight: 800; color: #1f1714; margin-top: 6px;">#${data.invoiceNumber}</div>
          <div style="font-size: 11.5px; color: #555; margin-top: 2px;"><strong>Date:</strong> ${data.date}</div>
        </td>
      </tr>
    </table>

    <!-- Billed To & Metadata Box -->
    <div class="meta-box">
      <table class="meta-table">
        <tr>
          <td class="meta-label">Billed To:</td>
          <td class="meta-val">${data.customerName}</td>
          <td class="meta-label">Invoice No:</td>
          <td class="meta-val">${data.invoiceNumber}</td>
        </tr>
        <tr>
          <td class="meta-label">Mobile:</td>
          <td class="meta-val">${data.customerMobile}</td>
          <td class="meta-label">Invoice Date:</td>
          <td class="meta-val">${data.date}</td>
        </tr>
        <tr>
          <td class="meta-label">Payment Mode:</td>
          <td class="meta-val" style="color: #15803d;">${data.paymentMethod} (Verified & Paid)</td>
          <td class="meta-label">State Code:</td>
          <td class="meta-val">${BILLING_IDENTITY.stateCode} (${BILLING_IDENTITY.stateName})</td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 6%;" class="text-center">#</th>
          <th style="width: 48%;">Item Description & Customization</th>
          <th style="width: 14%;" class="text-center">Dietary</th>
          <th style="width: 8%;" class="text-center">Qty</th>
          <th style="width: 12%;" class="text-right">Unit Rate (₹)</th>
          <th style="width: 12%;" class="text-right">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${data.items
          .map(
            (item, index) => `
          <tr>
            <td class="text-center" style="font-weight: 600; color: #666;">${index + 1}</td>
            <td>
              <div style="font-weight: 700; color: #1f1714;">${item.name}</div>
              ${item.isCustom ? `<span style="font-size: 9px; font-weight: 700; color: #7b3211; background: #faede4; padding: 1px 4px; border-radius: 2px;">Custom Order</span>` : ""}
              ${item.notes ? `<div class="item-notes">Special Inscription: "${item.notes}"</div>` : ""}
            </td>
            <td class="text-center">
              ${
                item.isEggless !== false
                  ? `<span class="diet-badge diet-veg">100% Eggless</span>`
                  : `<span class="diet-badge diet-nonveg">Contains Egg</span>`
              }
            </td>
            <td class="text-center" style="font-weight: 700;">${item.quantity}</td>
            <td class="text-right">${item.price.toLocaleString("en-IN")}</td>
            <td class="text-right" style="font-weight: 700;">${(item.price * item.quantity).toLocaleString("en-IN")}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <!-- Totals & Words Section -->
    <table class="summary-section">
      <tr>
        <td class="words-col">
          <div class="words-box">
            <strong>Amount Chargeable (in words):</strong><br>
            <span style="font-style: italic; font-weight: 700; color: #3a2016;">${numberToWords(data.grandTotal)}</span>
            <div style="margin-top: 8px; font-size: 10px; color: #777;">
              • Bakery Tax Invoice issued under Section 31 of CGST Act, 2017.<br>
              • Food grade packaging, safe for direct food contact.
            </div>
          </div>
        </td>
        <td class="totals-col">
          <table class="totals-table">
            <tr>
              <td style="color: #555;">Items Subtotal:</td>
              <td class="text-right" style="font-weight: 600;">₹${data.subtotal.toLocaleString("en-IN")}</td>
            </tr>
            ${
              data.includeGst && data.gstRate > 0
                ? `
              <tr>
                <td style="color: #555;">Central GST (CGST ${(data.gstRate / 2).toFixed(1)}%):</td>
                <td class="text-right">₹${(data.tax / 2).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color: #555;">State GST (SGST ${(data.gstRate / 2).toFixed(1)}%):</td>
                <td class="text-right">₹${(data.tax / 2).toFixed(2)}</td>
              </tr>`
                : `<tr><td style="color: #555;">Bakery GST:</td><td class="text-right">${data.includeGst ? "0% (Exempt)" : "Included in Unit Rate"}</td></tr>`
            }
            ${
              data.deliveryFee > 0
                ? `<tr><td style="color: #555;">Custom Delivery / Box:</td><td class="text-right font-medium">+₹${data.deliveryFee}</td></tr>`
                : ""
            }
            ${
              data.discount > 0
                ? `<tr><td style="color: #555;">Special Discount / Rebate:</td><td class="text-right font-medium" style="color: #b91c1c;">-₹${data.discount}</td></tr>`
                : ""
            }
            <tr class="grand-total-row">
              <td>TOTAL AMOUNT PAID:</td>
              <td class="text-right">₹${data.grandTotal.toLocaleString("en-IN")}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Footer Terms & Signatures -->
    <div class="footer-section">
      <div class="terms-col">
        <strong>Terms & Conditions:</strong><br>
        1. All our cakes & bakes are prepared fresh with pure butter and premium ingredients.<br>
        2. Please store cream cakes and pastries refrigerated below 5°C.<br>
        3. Thank you for choosing Kichee's Baked Delights to sweeten your celebrations!
      </div>
      <div class="signature-col">
        <div class="sign-space"></div>
        <div class="sign-line">
          For Kichee's Baked Delights<br>
          <span style="font-size: 9.5px; font-weight: normal; color: #666;">Authorized Signatory</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Triggers isolated direct printing for pure PDF/Paper invoice without any web UI
function printInvoiceDocument(data: InvoicePrintData) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const html = generateInvoiceHtml(data);
  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1500);
  }, 350);
}

export default function AdminBillingPage() {
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerMobile, setCustomerMobile] = useState("+91 98400 00000");
  const [paymentMethod, setPaymentMethod] = useState<
    "UPI" | "CASH" | "CARD" | "ONLINE"
  >("UPI");
  const [products, setProducts] = useState<AdminProductItem[]>(getInventoryProducts);
  const [billItems, setBillItems] = useState<BillItem[]>([]);

  // Customization & calculation controls
  const [discount, setDiscount] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [gstRate, setGstRate] = useState<number>(5);
  const [invoiceSuccess, setInvoiceSuccess] = useState<string | null>(null);
  const [invoiceDate, setInvoiceDate] = useState<string>("");

  // Invoice Modal & Print Format State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [printFormat, setPrintFormat] = useState<"a4" | "thermal">("a4");

  // Product catalog search and category filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Custom Item Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [customItemQty, setCustomItemQty] = useState("1");
  const [customItemIsEggless, setCustomItemIsEggless] = useState(true);
  const [customItemNotes, setCustomItemNotes] = useState("");

  // Inline Note Editor State
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [itemNoteInput, setItemNoteInput] = useState("");

  useEffect(() => {
    return subscribeInventory(() => {
      const live = getInventoryProducts();
      setProducts(live);
    });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["all", ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const subtotal = billItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const effectiveGstRate = includeGst ? Math.max(0, gstRate || 0) : 0;
  const tax = includeGst ? Math.round((subtotal * effectiveGstRate) / 100) : 0;
  const grandTotal = Math.max(0, subtotal + tax + deliveryFee - discount);

  // Add existing product from catalog
  const handleAddItem = (productId: string | number) => {
    const prod = products.find((p) => String(p.id) === String(productId));
    if (!prod) return;

    const basePrice = prod.price ?? 650;

    setBillItems((prev) => {
      const existing = prev.find((i) => String(i.id) === String(prod.id));
      if (existing) {
        return prev.map((i) =>
          String(i.id) === String(prod.id) ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: String(prod.id),
          name: prod.name,
          originalPrice: basePrice,
          price: basePrice,
          quantity: 1,
          isEggless: prod.isEggless !== false,
          category: prod.category || "Cakes",
        },
      ];
    });
  };

  // Add ad-hoc custom item/cake
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;

    const price = parseFloat(customItemPrice) || 0;
    const qty = Math.max(1, parseInt(customItemQty, 10) || 1);
    const newId = `custom-item-${Date.now()}`;

    setBillItems((prev) => [
      ...prev,
      {
        id: newId,
        name: customItemName.trim(),
        originalPrice: price,
        price,
        quantity: qty,
        isCustom: true,
        notes: customItemNotes.trim(),
        isEggless: customItemIsEggless,
        category: "Custom Order",
      },
    ]);

    // Reset custom modal form
    setCustomItemName("");
    setCustomItemPrice("");
    setCustomItemQty("1");
    setCustomItemIsEggless(true);
    setCustomItemNotes("");
    setIsCustomModalOpen(false);
  };

  // Price adjustment handler
  const handlePriceChange = (id: string, newPrice: number) => {
    setBillItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, price: Math.max(0, newPrice) } : item
      )
    );
  };

  // Quantity adjustment handler
  const handleQuantityChange = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setBillItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setBillItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Reset item price back to standard catalog price
  const handleResetPrice = (id: string) => {
    setBillItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, price: item.originalPrice } : item
      )
    );
  };

  // Save customization note
  const handleSaveItemNote = (id: string) => {
    setBillItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, notes: itemNoteInput.trim() } : item
      )
    );
    setEditingNoteItemId(null);
    setItemNoteInput("");
  };

  // Reset entire bill
  const handleResetBill = () => {
    if (billItems.length === 0 || confirm("Clear all items and start a fresh bill?")) {
      setBillItems([]);
      setDiscount(0);
      setDeliveryFee(0);
      setCustomerName("Walk-in Customer");
      setCustomerMobile("+91 98400 00000");
      setInvoiceSuccess(null);
      setIsInvoiceModalOpen(false);
    }
  };

  // Generate completed invoice & open on-screen bill modal
  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (billItems.length === 0) return;
    const invNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    setInvoiceDate(now);
    setInvoiceSuccess(invNum);
    setIsInvoiceModalOpen(true);
  };

  // Direct print function
  const triggerPrintReceipt = (format: "a4" | "thermal" = printFormat) => {
    if (!invoiceSuccess) return;
    printInvoiceDocument({
      invoiceNumber: invoiceSuccess,
      date: invoiceDate || new Date().toLocaleString("en-IN"),
      customerName,
      customerMobile,
      paymentMethod,
      items: billItems,
      subtotal,
      tax,
      includeGst,
      gstRate: effectiveGstRate,
      deliveryFee,
      discount,
      grandTotal,
      format,
    });
  };

  // WhatsApp share link generator
  const getWhatsAppShareUrl = () => {
    const cleanPhone = customerMobile.replace(/[^0-9]/g, "");
    const lines = [
      `*KICHEE'S BAKED DELIGHTS* 🎂`,
      `_Artisanal Cakes & Patisserie_`,
      `--------------------------------`,
      `*Bill / Tax Invoice:* #${invoiceSuccess || "INV"}`,
      `*Customer:* ${customerName}`,
      `*Date:* ${invoiceDate || new Date().toLocaleDateString("en-IN")}`,
      `--------------------------------`,
      `*Ordered Items:*`,
      ...billItems.map(
        (item) =>
          `• ${item.quantity}x ${item.name} (${item.isEggless !== false ? "Veg/Eggless" : "Contains Egg"}) @ ₹${item.price} = *₹${item.price * item.quantity}*${
            item.notes ? `\n  _${item.notes}_` : ""
          }`
      ),
      `--------------------------------`,
      `Subtotal: ₹${subtotal.toLocaleString("en-IN")}`,
      includeGst && effectiveGstRate > 0
        ? `GST (${effectiveGstRate}%): ₹${tax.toLocaleString("en-IN")}`
        : `GST: ${includeGst ? "0% (Exempt)" : "Included in price"}`,
      deliveryFee > 0 ? `Delivery / Packaging: ₹${deliveryFee}` : null,
      discount > 0 ? `Special Discount: -₹${discount}` : null,
      `*GRAND TOTAL: ₹${grandTotal.toLocaleString("en-IN")}*`,
      `*Payment Method:* ${paymentMethod} (Paid)`,
      `--------------------------------`,
      `Thank you for baking sweet memories with Kichee's!`,
      `📍 ${BILLING_IDENTITY.address}`,
      `GSTIN: ${BILLING_IDENTITY.gstin}`,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-amber-800" />
            <span>Billing & Custom POS Counter</span>
          </h1>
          <p className="text-xs text-stone-500">
            Create customized bills, edit item prices on the fly, add bespoke custom orders, and generate authentic PDF tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCustomModalOpen(true)}
            className="h-9 text-xs bg-amber-900 text-white hover:bg-amber-950 hover:text-white border-amber-900 font-semibold gap-1.5 shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            + Add Custom Cake / Item
          </Button>

          {billItems.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetBill}
              className="h-9 text-xs border-stone-300 text-stone-700 hover:text-red-700 hover:bg-red-50"
            >
              Clear Bill
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Success Banner */}
      {invoiceSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm text-emerald-950">
                  Invoice #{invoiceSuccess} generated successfully!
                </p>
                <p className="text-xs text-emerald-800">
                  Total: <strong>₹{grandTotal.toLocaleString("en-IN")}</strong> • Paid via {paymentMethod} • Customer: {customerName} ({customerMobile})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsInvoiceModalOpen(true)}
                className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs gap-1.5 h-8 font-semibold shadow-xs"
              >
                <Eye className="h-3.5 w-3.5" />
                View & Print Bill
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => triggerPrintReceipt("a4")}
                className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs gap-1.5 h-8 font-semibold"
              >
                <Printer className="h-3.5 w-3.5" />
                Print A4 PDF
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(getWhatsAppShareUrl(), "_blank")}
                className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs gap-1.5 h-8 font-semibold"
              >
                <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                WhatsApp Bill
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetBill}
                className="text-emerald-900 hover:bg-emerald-100/60 text-xs h-8"
              >
                New Sale
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick Item Selector & Catalog (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-stone-200 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-amber-800" />
                  <span>Bakery Menu & Catalog</span>
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCustomModalOpen(true)}
                  className="h-7 text-[11px] text-amber-900 hover:bg-amber-50 font-semibold px-2"
                >
                  + Custom Item
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                <Input
                  type="search"
                  placeholder="Search cake, brownie, bagel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-stone-50 border-stone-200 text-stone-900"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pt-2 pb-0.5 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? "bg-amber-900 text-white border-amber-900 font-semibold"
                        : "bg-white text-stone-600 border-stone-200 hover:border-amber-700"
                    }`}
                  >
                    {cat === "all" ? "All Items" : cat}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-3 max-h-[520px] overflow-y-auto space-y-1.5 divide-y divide-stone-100">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  No baked items match your search.
                </div>
              ) : (
                filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 transition-colors pt-2"
                  >
                    <div className="space-y-0.5 pr-2 flex-1">
                      <div className="flex items-center gap-1.5">
                        {prod.isEggless !== false ? (
                          <span
                            className="inline-flex items-center justify-center w-3 h-3 border border-emerald-600 rounded-[2px] bg-white p-[1px] shrink-0"
                            title="Vegetarian / Eggless"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center justify-center w-3 h-3 border border-amber-800 rounded-[2px] bg-white p-[1px] shrink-0"
                            title="Contains Egg"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-800"></span>
                          </span>
                        )}
                        <p className="text-xs font-semibold text-stone-900 line-clamp-1">
                          {prod.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span className="font-bold text-amber-950">
                          ₹{(prod.price ?? 650).toLocaleString("en-IN")}
                        </span>
                        <span>•</span>
                        <span className="text-[10px] text-stone-400">{prod.category}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddItem(prod.id)}
                      className="h-7 px-2.5 text-xs shrink-0 bg-white border-stone-200 hover:border-amber-800 hover:bg-amber-50 hover:text-amber-900 font-semibold"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Active Bill with Custom Price Editing (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-stone-200 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Receipt className="h-4 w-4 text-amber-800" />
                    <span>Current Bill & Custom Pricing</span>
                  </CardTitle>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Click and edit any item price directly in the table to apply custom discounts or special client rates.
                  </p>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200 text-xs">
                  {billItems.length} {billItems.length === 1 ? "Item" : "Items"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Customer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-stone-50/70 border border-stone-100">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                    <User className="w-3 h-3 text-stone-400" />
                    Customer Name
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="h-8 text-xs bg-white border-stone-300 text-stone-900 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-stone-400" />
                    Mobile Number (for WhatsApp Bill)
                  </label>
                  <Input
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="+91 98400 00000"
                    className="h-8 text-xs bg-white border-stone-300 text-stone-900 font-medium"
                  />
                </div>
              </div>

              {/* Items Table with Direct Price Editing */}
              <div className="rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
                <Table>
                  <TableHeader className="bg-stone-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-stone-700">Item Description</TableHead>
                      <TableHead className="text-xs font-semibold text-center text-stone-700 w-24">Qty</TableHead>
                      <TableHead className="text-xs font-semibold text-right text-stone-700 w-32">
                        Unit Price (₹)
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-right text-stone-700 w-24">Line Total</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-stone-400 text-xs">
                          No items added yet. Click &quot;Add&quot; from the catalog or &quot;+ Add Custom Cake&quot; to begin.
                        </TableCell>
                      </TableRow>
                    ) : (
                      billItems.map((item) => {
                        const isPriceCustomized = item.price !== item.originalPrice && !item.isCustom;
                        return (
                          <React.Fragment key={item.id}>
                            <TableRow className="hover:bg-stone-50/50">
                              {/* Item Description */}
                              <TableCell className="text-xs">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    {item.isEggless !== false ? (
                                      <span
                                        className="inline-flex items-center justify-center w-3 h-3 border border-emerald-600 rounded-[2px] bg-white p-[1px] shrink-0"
                                        title="Vegetarian / Eggless"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                      </span>
                                    ) : (
                                      <span
                                        className="inline-flex items-center justify-center w-3 h-3 border border-amber-800 rounded-[2px] bg-white p-[1px] shrink-0"
                                        title="Contains Egg"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-800"></span>
                                      </span>
                                    )}
                                    <span className="font-semibold text-stone-900">
                                      {item.name}
                                    </span>
                                    {item.isCustom && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded">
                                        Custom Item
                                      </span>
                                    )}
                                  </div>

                                  {/* Custom Note or Add Note Button */}
                                  {item.notes ? (
                                    <p className="text-[10px] text-amber-900 font-medium italic pl-4">
                                      Note: {item.notes}
                                    </p>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingNoteItemId(item.id);
                                        setItemNoteInput(item.notes || "");
                                      }}
                                      className="text-[10px] text-stone-400 hover:text-amber-800 underline pl-4"
                                    >
                                      + Add cake inscription / chef note
                                    </button>
                                  )}
                                </div>
                              </TableCell>

                              {/* Quantity Stepper */}
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="h-6 w-6 text-stone-600 bg-white border-stone-300 hover:bg-stone-100"
                                  >
                                    -
                                  </Button>
                                  <span className="w-6 text-center font-bold text-xs text-stone-900">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="h-6 w-6 text-stone-600 bg-white border-stone-300 hover:bg-stone-100"
                                  >
                                    +
                                  </Button>
                                </div>
                              </TableCell>

                              {/* Editable Unit Price */}
                              <TableCell className="text-right">
                                <div className="flex flex-col items-end gap-1">
                                  <div className="flex items-center justify-end gap-1">
                                    <span className="text-stone-400 text-xs font-semibold">₹</span>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={item.price}
                                      onChange={(e) =>
                                        handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                                      }
                                      title="Edit customized price"
                                      className={`h-8 w-24 text-right text-xs font-bold bg-white text-stone-900 border transition-all ${
                                        isPriceCustomized
                                          ? "border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/40"
                                          : "border-stone-300 focus:border-amber-800"
                                      }`}
                                    />
                                    {isPriceCustomized && (
                                      <button
                                        type="button"
                                        onClick={() => handleResetPrice(item.id)}
                                        title={`Reset to standard price (₹${item.originalPrice})`}
                                        className="text-stone-400 hover:text-amber-800 p-1"
                                      >
                                        <RotateCcw className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>

                                  {isPriceCustomized && (
                                    <span className="text-[9px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 rounded px-1">
                                      Custom Price (std ₹{item.originalPrice})
                                    </span>
                                  )}
                                </div>
                              </TableCell>

                              {/* Total for this item */}
                              <TableCell className="text-xs text-right font-bold text-stone-900">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </TableCell>

                              {/* Delete button */}
                              <TableCell className="text-right p-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="h-7 w-7 text-stone-400 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>

                            {/* Inline Note Editor Row */}
                            {editingNoteItemId === item.id && (
                              <TableRow className="bg-amber-50/50">
                                <TableCell colSpan={5} className="py-2 px-3">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      size={1}
                                      value={itemNoteInput}
                                      onChange={(e) => setItemNoteInput(e.target.value)}
                                      placeholder="e.g. Inscription: 'Happy Birthday John' | Golden pearl border | 5 PM pickup"
                                      className="h-7 text-xs bg-white border-amber-300 text-stone-900 flex-1"
                                    />
                                    <Button
                                      size="sm"
                                      type="button"
                                      onClick={() => handleSaveItemNote(item.id)}
                                      className="h-7 text-xs bg-amber-900 text-white hover:bg-amber-950 px-2.5 font-semibold"
                                    >
                                      Save Note
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      type="button"
                                      onClick={() => setEditingNoteItemId(null)}
                                      className="h-7 text-xs text-stone-500"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Extra Customization Calculations */}
              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2.5 text-xs">
                {/* Subtotal */}
                <div className="flex justify-between text-stone-700 font-medium">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-stone-900">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                {/* GST Controls: Toggle & Percentage Selector */}
                <div className="space-y-2 p-2.5 rounded-lg bg-white border border-stone-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-stone-700">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-stone-800">
                      <input
                        type="checkbox"
                        checked={includeGst}
                        onChange={(e) => setIncludeGst(e.target.checked)}
                        className="rounded border-stone-300 text-amber-900 focus:ring-amber-800 accent-amber-900"
                      />
                      <span>Apply GST Tax</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-stone-500 font-medium text-xs">GST Rate:</span>
                      <div className="relative flex items-center">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          disabled={!includeGst}
                          value={gstRate === 0 && !includeGst ? "" : gstRate}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setGstRate(isNaN(val) ? 0 : Math.max(0, Math.min(100, val)));
                          }}
                          className="h-7 w-20 text-right text-xs font-bold bg-white border-stone-300 text-stone-900 pr-5 disabled:opacity-50"
                        />
                        <span className="absolute right-1.5 text-stone-400 text-xs font-bold pointer-events-none">%</span>
                      </div>
                    </div>
                  </div>

                  {includeGst ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1.5 border-t border-stone-100">
                      {/* Quick preset chips */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-stone-400 font-medium mr-0.5">Presets:</span>
                        {[0, 5, 12, 18].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => setGstRate(rate)}
                            className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                              gstRate === rate
                                ? "bg-amber-900 text-white border-amber-900 font-bold shadow-2xs"
                                : "bg-stone-50 text-stone-700 border-stone-200 hover:border-amber-700"
                            }`}
                          >
                            {rate}%
                          </button>
                        ))}
                      </div>

                      {/* Calculated GST display with CGST + SGST split */}
                      <div className="text-left sm:text-right">
                        <span className="font-bold text-stone-900 text-xs">
                          ₹{tax.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          CGST {(effectiveGstRate / 2).toFixed(1)}% (₹{(tax / 2).toFixed(1)}) + SGST {(effectiveGstRate / 2).toFixed(1)}% (₹{(tax / 2).toFixed(1)})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                      GST tax exempt / included in product prices.
                    </div>
                  )}
                </div>

                {/* Custom Discount Input */}
                <div className="flex items-center justify-between text-stone-700">
                  <span className="flex items-center gap-1 font-medium">
                    <Percent className="h-3.5 w-3.5 text-amber-800" />
                    Special Discount / Bill Rebate (₹)
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-400 font-medium">- ₹</span>
                    <Input
                      type="number"
                      min="0"
                      value={discount === 0 ? "" : discount}
                      onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0"
                      className="h-7 w-24 text-right text-xs bg-white border-stone-300 text-stone-900 font-semibold"
                    />
                  </div>
                </div>

                {/* Custom Delivery / Special Packaging */}
                <div className="flex items-center justify-between text-stone-700">
                  <span className="flex items-center gap-1 font-medium">
                    <Truck className="h-3.5 w-3.5 text-amber-800" />
                    Custom Delivery / Packaging (₹)
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-400 font-medium">+ ₹</span>
                    <Input
                      type="number"
                      min="0"
                      value={deliveryFee === 0 ? "" : deliveryFee}
                      onChange={(e) => setDeliveryFee(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0"
                      className="h-7 w-24 text-right text-xs bg-white border-stone-300 text-stone-900 font-semibold"
                    />
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Grand Total (Net Payable)</span>
                  <span className="text-xl text-amber-950 font-extrabold">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-stone-700">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["UPI", "CASH", "CARD", "ONLINE"] as const).map((method) => (
                    <Button
                      key={method}
                      type="button"
                      variant={paymentMethod === method ? "default" : "outline"}
                      onClick={() => setPaymentMethod(method)}
                      className={`h-8 text-xs font-bold transition-all ${
                        paymentMethod === method
                          ? "bg-amber-900 hover:bg-amber-950 text-white border-amber-900 shadow-xs"
                          : "bg-white text-stone-700 border-stone-300 hover:border-amber-700"
                      }`}
                    >
                      {method}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleCreateBill}
                  disabled={billItems.length === 0}
                  className="flex-1 h-11 bg-amber-900 hover:bg-amber-950 text-white font-bold text-sm shadow-xs"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Complete Sale & Generate Bill (₹{grandTotal.toLocaleString("en-IN")})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dedicated Tax Invoice & Print Receipt Modal */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-0">
          <div className="p-6 space-y-4">
            {/* Modal Top Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
              <div>
                <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-amber-800" />
                  <span>Tax Invoice #{invoiceSuccess}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-stone-500">
                  Official tax invoice generated. You can print directly, download as PDF, or send via WhatsApp.
                </DialogDescription>
              </div>

              {/* Print Format Switcher & Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-100">
                  <button
                    type="button"
                    onClick={() => setPrintFormat("a4")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      printFormat === "a4"
                        ? "bg-white text-amber-900 shadow-2xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    A4 Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintFormat("thermal")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      printFormat === "thermal"
                        ? "bg-white text-amber-900 shadow-2xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    80mm Thermal
                  </button>
                </div>

                <Button
                  onClick={() => triggerPrintReceipt(printFormat)}
                  className="bg-amber-900 hover:bg-amber-950 text-white text-xs h-8 gap-1.5 font-bold shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print / Save PDF
                </Button>
              </div>
            </div>

            {/* Realistic Preview of the Invoice Document (Zero website UI inside) */}
            <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 overflow-x-auto">
              <div
                className={`bg-white shadow-md mx-auto text-stone-900 font-sans ${
                  printFormat === "thermal"
                    ? "max-w-[340px] p-4 text-[11px] border border-stone-300 font-mono"
                    : "max-w-[720px] p-8 text-xs border border-stone-300 rounded-lg"
                }`}
              >
                {/* Brand Header */}
                <div className={printFormat === "thermal" ? "text-center mb-3" : "flex justify-between items-start mb-6"}>
                  <div>
                    <h2 className="text-xl font-extrabold text-amber-950 tracking-tight uppercase">
                      Kichee&apos;s Baked Delights
                    </h2>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
                      Artisanal Oven-Fresh Patisserie & Bespoke Cake Studio
                    </p>
                    <div className="text-[11px] text-stone-600 mt-1 space-y-0.5">
                      <p>{BILLING_IDENTITY.address}</p>
                      <p>Ph: {BILLING_IDENTITY.phone}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded">
                        GSTIN: {BILLING_IDENTITY.gstin}
                      </span>
                    </div>
                  </div>

                  {printFormat === "a4" && (
                    <div className="text-right">
                      <span className="text-sm font-black text-amber-900 tracking-wider">TAX INVOICE</span>
                      <p className="text-base font-extrabold text-stone-900 mt-1">#{invoiceSuccess}</p>
                      <p className="text-[11px] text-stone-500">{invoiceDate}</p>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 mt-2 text-[10px]">
                        PAID VIA {paymentMethod}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Billed To Meta */}
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 mb-4 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-stone-400 font-semibold block text-[10px]">BILLED TO:</span>
                      <strong className="text-stone-900 text-sm">{customerName}</strong>
                      <p className="text-stone-600 text-xs font-mono">{customerMobile}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-400 font-semibold block text-[10px]">PAYMENT & MODE:</span>
                      <strong className="text-emerald-700">{paymentMethod} (Verified)</strong>
                      <p className="text-stone-500 text-[11px]">Walk-in Storefront Counter</p>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full border-collapse mb-4 text-xs">
                  <thead>
                    <tr className="bg-amber-950 text-white text-[11px]">
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-center w-16">Dietary</th>
                      <th className="p-2 text-center w-12">Qty</th>
                      <th className="p-2 text-right w-20">Rate</th>
                      <th className="p-2 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {billItems.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? "bg-stone-50/60" : ""}>
                        <td className="p-2">
                          <strong className="text-stone-900">{item.name}</strong>
                          {item.isCustom && (
                            <span className="ml-1.5 text-[9px] bg-amber-100 text-amber-900 font-bold px-1 rounded">
                              Custom
                            </span>
                          )}
                          {item.notes && (
                            <div className="text-[10px] text-amber-900 italic mt-0.5">
                              Note: {item.notes}
                            </div>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {item.isEggless !== false ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 rounded">
                              Veg
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1 rounded">
                              Non-Veg
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-center font-bold">{item.quantity}</td>
                        <td className="p-2 text-right">₹{item.price.toLocaleString("en-IN")}</td>
                        <td className="p-2 text-right font-bold">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Calculations & Words */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-200 pt-3">
                  <div className="space-y-2">
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-[11px]">
                      <span className="text-stone-500 font-semibold block text-[10px]">AMOUNT IN WORDS:</span>
                      <strong className="text-amber-950 italic">{numberToWords(grandTotal)}</strong>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      Tax invoice issued under section 31 of CGST Act. Keep refrigerated under 5°C.
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Items Subtotal:</span>
                      <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    {includeGst ? (
                      <>
                        <div className="flex justify-between text-stone-500 text-[11px]">
                          <span>CGST ({(effectiveGstRate / 2).toFixed(1)}%):</span>
                          <span>₹{(tax / 2).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-stone-500 text-[11px]">
                          <span>SGST ({(effectiveGstRate / 2).toFixed(1)}%):</span>
                          <span>₹{(tax / 2).toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-stone-500 text-[11px]">
                        <span>Bakery GST:</span>
                        <span>Included in Rate</span>
                      </div>
                    )}
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>Delivery / Packaging:</span>
                        <span>+₹{deliveryFee}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-red-700 font-medium">
                        <span>Special Discount:</span>
                        <span>-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm font-extrabold text-amber-950 pt-2 border-t border-stone-300">
                      <span>TOTAL PAID:</span>
                      <span className="text-base font-black">₹{grandTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Receipt Footer */}
                <div className="mt-6 pt-3 border-t border-stone-200 flex justify-between items-end text-[10px] text-stone-500">
                  <div>
                    <p className="font-bold text-stone-800">Thank you for ordering with Kichee&apos;s!</p>
                    <p>Follow our pastry updates @kicheesdelights</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-stone-800">For Kichee&apos;s Baked Delights</p>
                    <p className="text-[9px] text-stone-400">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-200">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => triggerPrintReceipt("a4")}
                  className="bg-amber-900 hover:bg-amber-950 text-white text-xs gap-1.5 h-9 font-bold"
                >
                  <Printer className="h-4 w-4" />
                  Print Official Invoice (A4)
                </Button>

                <Button
                  variant="outline"
                  onClick={() => triggerPrintReceipt("thermal")}
                  className="text-xs gap-1.5 h-9 border-stone-300 text-stone-700"
                >
                  <Receipt className="h-4 w-4 text-stone-500" />
                  Print Thermal Slip (80mm)
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.open(getWhatsAppShareUrl(), "_blank")}
                  className="bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs gap-1.5 h-9 font-semibold"
                >
                  <Share2 className="h-4 w-4 text-emerald-600" />
                  Send WhatsApp Bill
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsInvoiceModalOpen(false);
                  handleResetBill();
                }}
                className="text-stone-600 hover:text-stone-900 text-xs"
              >
                Done & Start Next Sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Custom Cake / Item Modal */}
      <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddCustomItem} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-800" />
                <span>Add Custom Cake / Ad-Hoc Item</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500">
                Add bespoke custom tiers, fondant figurines, party platters, or off-menu bakery orders with personalized pricing.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1">
              {/* Item Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Custom Item Name / Design Title *
                </label>
                <Input
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="e.g. 2-Tier Belgian Chocolate Truffle with Fondant Flowers"
                  required
                  className="h-8 text-xs bg-white border-stone-300 text-stone-900"
                />
              </div>

              {/* Custom Price & Qty */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Custom Price (₹) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    placeholder="e.g. 2400"
                    required
                    className="h-8 text-xs bg-white border-stone-300 text-stone-900 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(e.target.value)}
                    className="h-8 text-xs bg-white border-stone-300 text-stone-900 font-medium"
                  />
                </div>
              </div>

              {/* Quick Price Shortcuts */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-stone-400 font-medium">Quick Pricing:</span>
                {[500, 750, 1000, 1500, 2000, 2500, 3500].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCustomItemPrice(String(p))}
                    className="text-[10px] px-2 py-0.5 rounded border border-stone-200 bg-stone-50 hover:bg-amber-50 hover:border-amber-700 hover:text-amber-900 transition-colors font-medium cursor-pointer"
                  >
                    ₹{p}
                  </button>
                ))}
              </div>

              {/* Dietary Classification: Veg vs Non-Veg */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-stone-700">
                  Dietary Classification
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomItemIsEggless(true)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition-all ${
                      customItemIsEggless
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-600"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-3 h-3 border border-emerald-600 rounded-[2px] bg-white p-[1px] shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    </span>
                    <span>100% Eggless (Veg)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomItemIsEggless(false)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition-all ${
                      !customItemIsEggless
                        ? "border-amber-800 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-800"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-3 h-3 border border-amber-800 rounded-[2px] bg-white p-[1px] shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-800"></span>
                    </span>
                    <span>Contains Egg</span>
                  </button>
                </div>
              </div>

              {/* Customization Details & Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Custom Inscription / Chef Notes
                </label>
                <textarea
                  value={customItemNotes}
                  onChange={(e) => setCustomItemNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Message: 'Happy 25th Silver Jubilee' | Light sugar | Garnish with roasted hazelnuts"
                  className="w-full text-xs rounded-md border border-stone-300 bg-white p-2 text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCustomModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs"
              >
                Add Custom Item to Bill
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
