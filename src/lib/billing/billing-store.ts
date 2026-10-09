import { BUSINESS_CONFIG } from "@/lib/config/business";

export interface BillItem {
  id: string;
  name: string;
  originalPrice: number;
  price: number;
  quantity: number;
  isCustom?: boolean;
  notes?: string;
  isEggless?: boolean;
  category?: string;
  hsnCode?: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  rawDate: string; // ISO 8601 string for filtering
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  paymentMethod: "UPI" | "CASH" | "CARD" | "ONLINE";
  items: BillItem[];
  subtotal: number;
  tax: number;
  includeGst: boolean;
  gstRate: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  format?: "a4" | "thermal";
  status: "PAID" | "CANCELLED";
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = "kichees_billing_invoices_v2";

export const INITIAL_BILLING_INVOICES: BillingInvoice[] = [
  {
    id: "inv-2026-1001",
    invoiceNumber: "INV-2026-1001",
    date: "02 Oct 2026, 11:15 AM",
    rawDate: "2026-10-02T11:15:00.000Z",
    customerName: "Aishwarya Sundaram",
    customerMobile: "+91 98401 22345",
    customerEmail: "aishwarya.s@gmail.com",
    paymentMethod: "UPI",
    items: [
      {
        id: "item-1",
        name: "Belgian Dark Chocolate Truffle Cake (1 Kg)",
        originalPrice: 1250,
        price: 1250,
        quantity: 1,
        isEggless: true,
        category: "Signature Cakes",
        hsnCode: "1905",
      },
      {
        id: "item-2",
        name: "Signature Salted Caramel Brownie Box (4 Pcs)",
        originalPrice: 480,
        price: 480,
        quantity: 1,
        isEggless: true,
        category: "Brownies",
        hsnCode: "1905",
      },
    ],
    subtotal: 1730,
    includeGst: true,
    gstRate: 5,
    tax: 86.5,
    deliveryFee: 0,
    discount: 50,
    grandTotal: 1766.5,
    status: "PAID",
    createdAt: "2026-10-02T11:15:00.000Z",
  },
  {
    id: "inv-2026-1002",
    invoiceNumber: "INV-2026-1002",
    date: "03 Oct 2026, 02:40 PM",
    rawDate: "2026-10-03T14:40:00.000Z",
    customerName: "Rajesh Kannan",
    customerMobile: "+91 98840 91823",
    customerEmail: "rajesh.k@innovatech.io",
    paymentMethod: "CARD",
    items: [
      {
        id: "item-3",
        name: "Classic Red Velvet Cream Cheese Cake (1.5 Kg)",
        originalPrice: 1650,
        price: 1650,
        quantity: 1,
        isEggless: false,
        category: "Classic Cakes",
        hsnCode: "1905",
      },
    ],
    subtotal: 1650,
    includeGst: true,
    gstRate: 5,
    tax: 82.5,
    deliveryFee: 80,
    discount: 0,
    grandTotal: 1812.5,
    status: "PAID",
    createdAt: "2026-10-03T14:40:00.000Z",
  },
  {
    id: "inv-2026-1003",
    invoiceNumber: "INV-2026-1003",
    date: "04 Oct 2026, 04:20 PM",
    rawDate: "2026-10-04T16:20:00.000Z",
    customerName: "Meenakshi Ramanathan",
    customerMobile: "+91 97910 44512",
    customerEmail: "meena.ram@yahoo.com",
    paymentMethod: "CASH",
    items: [
      {
        id: "item-4",
        name: "New York Baked Cheesecake (Slice)",
        originalPrice: 280,
        price: 280,
        quantity: 3,
        isEggless: true,
        category: "Cheesecakes",
        hsnCode: "1905",
      },
      {
        id: "item-5",
        name: "Assorted French Macarons Box (6 Pcs)",
        originalPrice: 450,
        price: 450,
        quantity: 2,
        isEggless: false,
        category: "Patisserie",
        hsnCode: "1905",
      },
    ],
    subtotal: 1740,
    includeGst: true,
    gstRate: 5,
    tax: 87,
    deliveryFee: 0,
    discount: 0,
    grandTotal: 1827,
    status: "PAID",
    createdAt: "2026-10-04T16:20:00.000Z",
  },
  {
    id: "inv-2026-1004",
    invoiceNumber: "INV-2026-1004",
    date: "05 Oct 2026, 06:10 PM",
    rawDate: "2026-10-05T18:10:00.000Z",
    customerName: "Deepak Chawla",
    customerMobile: "+91 99402 77819",
    paymentMethod: "UPI",
    items: [
      {
        id: "item-6",
        name: "2-Tier Golden Jubilee Floral Cake (Custom)",
        originalPrice: 3800,
        price: 3600,
        quantity: 1,
        isCustom: true,
        isEggless: true,
        notes: "Edible golden leaf border, Fondant 50th topper",
        category: "Custom Order",
        hsnCode: "1905",
      },
    ],
    subtotal: 3600,
    includeGst: true,
    gstRate: 5,
    tax: 180,
    deliveryFee: 150,
    discount: 100,
    grandTotal: 3830,
    status: "PAID",
    createdAt: "2026-10-05T18:10:00.000Z",
  },
  {
    id: "inv-2026-1005",
    invoiceNumber: "INV-2026-1005",
    date: "06 Oct 2026, 01:05 PM",
    rawDate: "2026-10-06T13:05:00.000Z",
    customerName: "Walk-in Store Customer",
    customerMobile: "+91 98400 00000",
    paymentMethod: "CASH",
    items: [
      {
        id: "item-7",
        name: "Nutella Hazelnut Babka Loaf",
        originalPrice: 350,
        price: 350,
        quantity: 2,
        isEggless: true,
        category: "Artisanal Breads",
        hsnCode: "1905",
      },
      {
        id: "item-8",
        name: "Almond Frangipane Tart",
        originalPrice: 220,
        price: 220,
        quantity: 2,
        isEggless: false,
        category: "Tarts",
        hsnCode: "1905",
      },
    ],
    subtotal: 1140,
    includeGst: true,
    gstRate: 5,
    tax: 57,
    deliveryFee: 0,
    discount: 0,
    grandTotal: 1197,
    status: "PAID",
    createdAt: "2026-10-06T13:05:00.000Z",
  },
  {
    id: "inv-2026-1006",
    invoiceNumber: "INV-2026-1006",
    date: "07 Oct 2026, 05:45 PM",
    rawDate: "2026-10-07T17:45:00.000Z",
    customerName: "Kavitha Balakrishnan",
    customerMobile: "+91 98414 33210",
    customerEmail: "kavitha.b@cts.com",
    paymentMethod: "ONLINE",
    items: [
      {
        id: "item-9",
        name: "Pistachio Raspberry Rose Entremet (1 Kg)",
        originalPrice: 1850,
        price: 1850,
        quantity: 1,
        isEggless: true,
        category: "Signature Cakes",
        hsnCode: "1905",
      },
    ],
    subtotal: 1850,
    includeGst: true,
    gstRate: 5,
    tax: 92.5,
    deliveryFee: 80,
    discount: 0,
    grandTotal: 2022.5,
    status: "PAID",
    createdAt: "2026-10-07T17:45:00.000Z",
  },
  {
    id: "inv-2026-1007",
    invoiceNumber: "INV-2026-1007",
    date: "08 Oct 2026, 03:30 PM",
    rawDate: "2026-10-08T15:30:00.000Z",
    customerName: "Sanjay Narayanan",
    customerMobile: "+91 97100 55421",
    paymentMethod: "UPI",
    items: [
      {
        id: "item-10",
        name: "Eggless Blueberry Lemon Pound Cake",
        originalPrice: 650,
        price: 650,
        quantity: 1,
        isEggless: true,
        category: "Tea Cakes",
        hsnCode: "1905",
      },
      {
        id: "item-11",
        name: "Belgian Chocolate Éclair Box (3 Pcs)",
        originalPrice: 390,
        price: 390,
        quantity: 1,
        isEggless: false,
        category: "Patisserie",
        hsnCode: "1905",
      },
    ],
    subtotal: 1040,
    includeGst: true,
    gstRate: 5,
    tax: 52,
    deliveryFee: 0,
    discount: 40,
    grandTotal: 1052,
    status: "PAID",
    createdAt: "2026-10-08T15:30:00.000Z",
  },
];

type BillingSubscriber = (invoices: BillingInvoice[]) => void;
const subscribers = new Set<BillingSubscriber>();

export function getBillingInvoices(): BillingInvoice[] {
  if (typeof window === "undefined") {
    return INITIAL_BILLING_INVOICES;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BILLING_INVOICES));
      return INITIAL_BILLING_INVOICES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BILLING_INVOICES;
  } catch {
    return INITIAL_BILLING_INVOICES;
  }
}

export function saveBillingInvoice(invoice: BillingInvoice): BillingInvoice {
  const current = getBillingInvoices();
  // If invoice already exists, update it; otherwise add to top
  const index = current.findIndex((i) => i.id === invoice.id || i.invoiceNumber === invoice.invoiceNumber);
  let updated: BillingInvoice[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = invoice;
  } else {
    updated = [invoice, ...current];
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save billing invoice to localStorage", e);
    }
  }

  subscribers.forEach((cb) => cb(updated));
  return invoice;
}

export function deleteBillingInvoice(id: string): void {
  const current = getBillingInvoices();
  const updated = current.filter((i) => i.id !== id && i.invoiceNumber !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to delete billing invoice from localStorage", e);
    }
  }
  subscribers.forEach((cb) => cb(updated));
}

export function subscribeBillingInvoices(cb: BillingSubscriber): () => void {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}
