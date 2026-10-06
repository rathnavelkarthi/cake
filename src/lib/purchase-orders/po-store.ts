import { BUSINESS_CONFIG } from "@/lib/config/business";
import { localRawMaterials } from "@/lib/db/admin-data";

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  gstin?: string;
  address: string;
  category: string;
  paymentTerms: string;
}

export interface PurchaseOrderItem {
  id: string;
  name: string;
  sku?: string;
  rawMaterialId?: number;
  quantity: number;
  unit: "kg" | "l" | "pcs" | "boxes" | "bags";
  unitPrice: number;
  taxPercent: number; // e.g. 5, 12, 18
  totalPrice: number;
}

export type POStatus =
  | "DRAFT"
  | "SENT_TO_SUPPLIER"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier: Supplier;
  date: string;
  expectedDeliveryDate: string;
  deliveryLocation: string;
  paymentTerms: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxTotal: number;
  shippingFee: number;
  grandTotal: number;
  status: POStatus;
  notes?: string;
  stockUpdated: boolean;
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const PO_STORAGE_KEY = "kichees_purchase_orders_v1";
const SUPPLIER_STORAGE_KEY = "kichees_suppliers_v1";

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "Barry Callebaut India Pvt Ltd",
    contactPerson: "Rajesh Kulkarni",
    email: "rajesh.kulkarni@barry-callebaut.com",
    phone: "+91 98201 55210",
    gstin: "27AABCB1234F1Z8",
    address: "Bake-Pro Hub, Ambattur Industrial Estate, Chennai - 600058",
    category: "Chocolates & Cocoa",
    paymentTerms: "Net 30 Days",
  },
  {
    id: "sup-2",
    name: "Milky Mist Dairy Foods Ltd",
    contactPerson: "Praveen Kumar",
    email: "praveen.b2b@milkymist.com",
    phone: "+91 94432 11980",
    gstin: "33AABCM9910D1Z2",
    address: "Perundurai Cold Distribution Center, Erode, Tamil Nadu - 638052",
    category: "Dairy & Fats",
    paymentTerms: "Net 15 Days",
  },
  {
    id: "sup-3",
    name: "Aashirvaad Millers & Grains Co.",
    contactPerson: "Sundar Raman",
    email: "sundar.grains@aashirvaadfoods.com",
    phone: "+91 98410 77234",
    gstin: "33AAACA4481J1Z5",
    address: "Grain Exchange Complex, Royapuram, Chennai - 600013",
    category: "Flours & Grains",
    paymentTerms: "Immediate / Advance",
  },
  {
    id: "sup-4",
    name: "Bakersville India Fine Extracts",
    contactPerson: "Ananya Deshmukh",
    email: "orders@bakersvilleindia.com",
    phone: "+91 97654 32100",
    gstin: "27AAGCB5582K1Z9",
    address: "Flavour Industrial Park, MIDC, Indore / Mumbai Hub",
    category: "Flavours & Vanilla",
    paymentTerms: "Net 15 Days",
  },
  {
    id: "sup-5",
    name: "PackBakers Luxury Packaging Solutions",
    contactPerson: "Vigneshwaran M",
    email: "sales@packbakers.in",
    phone: "+91 98409 66120",
    gstin: "33AABCP3319E1Z0",
    address: "No. 44, Paper Mill Road, Perambur, Chennai - 600011",
    category: "Packaging & Boxes",
    paymentTerms: "Net 30 Days",
  },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po-101",
    poNumber: "PO-2026-0041",
    supplierId: "sup-1",
    supplier: INITIAL_SUPPLIERS[0],
    date: "2026-09-28",
    expectedDeliveryDate: "2026-10-01",
    deliveryLocation: "Kichee's Central Kitchen, 18/4 Wheatcrofts Rd, Nungambakkam, Chennai - 600034",
    paymentTerms: "Net 30 Days",
    items: [
      {
        id: "poi-1",
        name: "54% Callebaut Dark Belgian Chocolate",
        sku: "RAW-CHOC-01",
        rawMaterialId: 3,
        quantity: 25,
        unit: "kg",
        unitPrice: 850,
        taxPercent: 5,
        totalPrice: 22312.5,
      },
    ],
    subtotal: 21250,
    taxTotal: 1062.5,
    shippingFee: 350,
    grandTotal: 22662.5,
    status: "RECEIVED",
    stockUpdated: true,
    sentAt: "2026-09-28T10:00:00.000Z",
    receivedAt: "2026-10-01T11:30:00.000Z",
    notes: "Batch #B441 - Callebaut premium Couverture blocks for celebration cakes",
    createdAt: "2026-09-28T09:00:00.000Z",
    updatedAt: "2026-10-01T11:30:00.000Z",
  },
  {
    id: "po-102",
    poNumber: "PO-2026-0042",
    supplierId: "sup-2",
    supplier: INITIAL_SUPPLIERS[1],
    date: "2026-10-01",
    expectedDeliveryDate: "2026-10-03",
    deliveryLocation: "Kichee's Central Kitchen, 18/4 Wheatcrofts Rd, Nungambakkam, Chennai - 600034",
    paymentTerms: "Net 15 Days",
    items: [
      {
        id: "poi-2",
        name: "Unsalted Dairy Butter",
        sku: "RAW-BUTTER-01",
        rawMaterialId: 4,
        quantity: 30,
        unit: "kg",
        unitPrice: 520,
        taxPercent: 5,
        totalPrice: 16380,
      },
      {
        id: "poi-3",
        name: "Heavy Dairy Whipping Cream",
        sku: "RAW-CREAM-01",
        rawMaterialId: 8,
        quantity: 25,
        unit: "l",
        unitPrice: 220,
        taxPercent: 5,
        totalPrice: 5775,
      },
    ],
    subtotal: 21100,
    taxTotal: 1055,
    shippingFee: 200,
    grandTotal: 22355,
    status: "SENT_TO_SUPPLIER",
    stockUpdated: false,
    sentAt: "2026-10-01T14:00:00.000Z",
    notes: "Chilled Reefer vehicle delivery required before 9:00 AM",
    createdAt: "2026-10-01T13:30:00.000Z",
    updatedAt: "2026-10-01T14:00:00.000Z",
  },
  {
    id: "po-103",
    poNumber: "PO-2026-0043",
    supplierId: "sup-5",
    supplier: INITIAL_SUPPLIERS[4],
    date: "2026-10-02",
    expectedDeliveryDate: "2026-10-05",
    deliveryLocation: "Kichee's Central Kitchen, 18/4 Wheatcrofts Rd, Nungambakkam, Chennai - 600034",
    paymentTerms: "Net 30 Days",
    items: [
      {
        id: "poi-4",
        name: "Luxury Rigid 1.0kg Gateau Window Boxes (Gold Foil)",
        sku: "BOX-GOLD-1KG",
        quantity: 400,
        unit: "pcs",
        unitPrice: 22,
        taxPercent: 12,
        totalPrice: 9856,
      },
      {
        id: "poi-5",
        name: "Cake Base Boards (10-inch Gold Coated Stiff Boards)",
        sku: "BOARD-10IN",
        quantity: 300,
        unit: "pcs",
        unitPrice: 14,
        taxPercent: 12,
        totalPrice: 4704,
      },
    ],
    subtotal: 13000,
    taxTotal: 1560,
    shippingFee: 300,
    grandTotal: 14860,
    status: "DRAFT",
    stockUpdated: false,
    notes: "Branded with Kichee's Baked Delights gold foil crest logo",
    createdAt: "2026-10-02T10:00:00.000Z",
    updatedAt: "2026-10-02T10:00:00.000Z",
  },
];

let poCache: PurchaseOrder[] = [...INITIAL_PURCHASE_ORDERS];
let supplierCache: Supplier[] = [...INITIAL_SUPPLIERS];
const poListeners: Array<() => void> = [];

function emitPOChange() {
  poListeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("PO listener failed:", e);
    }
  });
}

export function subscribePurchaseOrders(listener: () => void): () => void {
  poListeners.push(listener);
  return () => {
    const idx = poListeners.indexOf(listener);
    if (idx !== -1) poListeners.splice(idx, 1);
  };
}

export function getPurchaseOrders(): PurchaseOrder[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(PO_STORAGE_KEY);
      if (stored) {
        poCache = JSON.parse(stored);
      } else {
        localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(poCache));
      }
    } catch (e) {
      console.warn("Could not read POs from localStorage:", e);
    }
  }
  return [...poCache].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function savePurchaseOrders(pos: PurchaseOrder[]): void {
  poCache = pos;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(pos));
    } catch (e) {
      console.warn("Could not save POs to localStorage:", e);
    }
  }
  emitPOChange();
}

export function getSuppliers(): Supplier[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(SUPPLIER_STORAGE_KEY);
      if (stored) {
        supplierCache = JSON.parse(stored);
      } else {
        localStorage.setItem(SUPPLIER_STORAGE_KEY, JSON.stringify(supplierCache));
      }
    } catch (e) {
      console.warn("Could not read suppliers from localStorage:", e);
    }
  }
  return [...supplierCache];
}

export function saveSuppliers(suppliers: Supplier[]): void {
  supplierCache = suppliers;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SUPPLIER_STORAGE_KEY, JSON.stringify(suppliers));
    } catch (e) {
      console.warn("Could not save suppliers to localStorage:", e);
    }
  }
}

export function addSupplier(data: Omit<Supplier, "id">): Supplier {
  const current = getSuppliers();
  const newSupplier: Supplier = {
    ...data,
    id: `sup-${Date.now()}`,
  };
  const updated = [newSupplier, ...current];
  saveSuppliers(updated);
  return newSupplier;
}

export function createPurchaseOrder(
  data: Omit<PurchaseOrder, "id" | "poNumber" | "stockUpdated" | "createdAt" | "updatedAt">
): PurchaseOrder {
  const all = getPurchaseOrders();
  const year = new Date().getFullYear();
  const poNumber = `PO-${year}-${String(all.length + 44).padStart(4, "0")}`;
  const now = new Date().toISOString();

  const newPO: PurchaseOrder = {
    ...data,
    id: `po-${Date.now()}`,
    poNumber,
    stockUpdated: false,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newPO, ...all];
  savePurchaseOrders(updated);
  return newPO;
}

export function updatePOStatus(
  id: string,
  newStatus: POStatus,
  extra?: { sentAt?: string; receivedAt?: string }
): PurchaseOrder | null {
  const all = getPurchaseOrders();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const po = all[idx];
  const updatedPO: PurchaseOrder = {
    ...po,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    ...(extra || {}),
  };

  // If marked as RECEIVED and stock wasn't previously updated, update raw materials stock!
  if (newStatus === "RECEIVED" && !po.stockUpdated) {
    receiveStock(id);
    updatedPO.stockUpdated = true;
    updatedPO.receivedAt = updatedPO.receivedAt || new Date().toISOString();
  }

  all[idx] = updatedPO;
  savePurchaseOrders(all);
  return updatedPO;
}

export function receiveStock(poId: string): boolean {
  const all = getPurchaseOrders();
  const po = all.find((p) => p.id === poId);
  if (!po) return false;

  // Iterate line items and update localRawMaterials stock
  po.items.forEach((item) => {
    let target = localRawMaterials.find(
      (m) =>
        (item.rawMaterialId && m.id === item.rawMaterialId) ||
        (item.sku && m.sku === item.sku) ||
        m.name.toLowerCase() === item.name.toLowerCase()
    );

    if (target) {
      target.stock = Number((target.stock + item.quantity).toFixed(2));
      // Optionally update cost per unit
      if (item.unitPrice > 0) {
        target.costPerUnit = item.unitPrice;
      }
    }
  });

  return true;
}

// Generates high standard printable HTML for Purchase Orders
export function generatePOHtml(po: PurchaseOrder): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Purchase Order - ${po.poNumber}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { color: #1c1917; font-size: 13px; line-height: 1.5; padding: 20px; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #78350f; }
    .brand-title { font-size: 24px; font-weight: 800; color: #3d2314; letter-spacing: -0.5px; }
    .brand-sub { font-size: 12px; color: #78716c; margin-top: 2px; }
    .company-details { font-size: 11.5px; color: #57534e; margin-top: 6px; line-height: 1.4; }
    .po-title { text-align: right; }
    .po-badge { display: inline-block; background: #fef3c7; color: #78350f; font-weight: 800; font-size: 12px; padding: 4px 12px; border-radius: 6px; text-transform: uppercase; margin-bottom: 6px; }
    .po-number { font-size: 20px; font-weight: 800; color: #1c1917; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
    .info-card { background: #faf8f5; border: 1px solid #ebd9c8; border-radius: 8px; padding: 14px 16px; }
    .info-card h4 { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #78350f; margin-bottom: 8px; letter-spacing: 0.5px; }
    .info-card p { font-size: 12.5px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 12.5px; }
    th { background: #3d2314; color: #fff; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    th.text-center, td.text-center { text-align: center; }
    th.text-right, td.text-right { text-align: right; }
    td { padding: 10px 12px; border-bottom: 1px solid #ebd9c8; vertical-align: top; }
    .item-title { font-weight: 700; color: #1c1917; }
    .item-sku { font-size: 11px; color: #78716c; }
    .totals-area { display: flex; justify-content: flex-end; margin-top: 10px; }
    .totals-table { width: 320px; border-collapse: collapse; }
    .totals-table td { padding: 6px 12px; border: none; font-size: 13px; }
    .totals-table tr.grand-total td { border-top: 2px solid #78350f; font-weight: 800; font-size: 16px; color: #78350f; padding-top: 10px; }
    .notes-box { background: #fffbeb; border: 1px dashed #d97706; border-radius: 8px; padding: 12px 16px; margin: 20px 0; font-size: 12px; color: #92400e; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; padding-top: 20px; }
    .sign-line { border-top: 1px solid #a8a29e; padding-top: 8px; font-size: 11.5px; color: #57534e; text-align: center; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #78716c; border-top: 1px solid #f0e6dc; padding-top: 12px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">${BUSINESS_CONFIG.billingName}</div>
      <div class="brand-sub">${BUSINESS_CONFIG.name} · Artisanal Cakes, Patisserie & Fine Bakes</div>
      <div class="company-details">
        ${BUSINESS_CONFIG.address.full}<br>
        <strong>GSTIN:</strong> ${BUSINESS_CONFIG.taxIdentity.gstin}<br>
        <strong>Email:</strong> ${BUSINESS_CONFIG.email} · <strong>Phone:</strong> ${BUSINESS_CONFIG.phoneDisplay}
      </div>
    </div>
    <div class="po-title">
      <div class="po-badge">${po.status}</div>
      <div class="po-number">${po.poNumber}</div>
      <div style="font-size: 12px; color: #78716c; margin-top: 4px;"><strong>Date:</strong> ${po.date}</div>
      <div style="font-size: 12px; color: #78716c;"><strong>Expected:</strong> ${po.expectedDeliveryDate || "Immediate"}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="info-card">
      <h4>Vendor / Supplier Details</h4>
      <p style="font-weight: 700; font-size: 14px; color: #1c1917;">${po.supplier.name}</p>
      ${po.supplier.contactPerson ? `<p><strong>Attn:</strong> ${po.supplier.contactPerson}</p>` : ""}
      ${po.supplier.email ? `<p><strong>Email:</strong> ${po.supplier.email}</p>` : ""}
      ${po.supplier.phone ? `<p><strong>Phone:</strong> ${po.supplier.phone}</p>` : ""}
      ${po.supplier.gstin ? `<p><strong>GSTIN:</strong> ${po.supplier.gstin}</p>` : ""}
      ${po.supplier.address ? `<p style="font-size: 11.5px; color: #57534e;">${po.supplier.address}</p>` : ""}
    </div>

    <div class="info-card">
      <h4>Shipping & Invoicing Instructions</h4>
      <p><strong>Ship To:</strong> ${po.deliveryLocation}</p>
      <p><strong>Payment Terms:</strong> ${po.paymentTerms}</p>
      <p><strong>Invoice To:</strong> ${BUSINESS_CONFIG.billingName}</p>
      <p><strong>Tax ID (GST):</strong> ${BUSINESS_CONFIG.taxIdentity.gstin}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;" class="text-center">#</th>
        <th>Item Description & Specification</th>
        <th style="width: 100px;" class="text-center">Quantity</th>
        <th style="width: 90px;" class="text-right">Unit Price</th>
        <th style="width: 70px;" class="text-right">GST %</th>
        <th style="width: 110px;" class="text-right">Total (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${po.items
        .map(
          (item, idx) => `
        <tr>
          <td class="text-center" style="color: #78716c;">${idx + 1}</td>
          <td>
            <div class="item-title">${item.name}</div>
            ${item.sku ? `<div class="item-sku">SKU: ${item.sku}</div>` : ""}
          </td>
          <td class="text-center" style="font-weight: 700;">${item.quantity} ${item.unit}</td>
          <td class="text-right">₹${item.unitPrice.toLocaleString("en-IN")}</td>
          <td class="text-right">${item.taxPercent}%</td>
          <td class="text-right" style="font-weight: 700;">₹${item.totalPrice.toLocaleString("en-IN")}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="totals-area">
    <table class="totals-table">
      <tr>
        <td style="color: #78716c;">Subtotal:</td>
        <td class="text-right" style="font-weight: 600;">₹${po.subtotal.toLocaleString("en-IN")}</td>
      </tr>
      <tr>
        <td style="color: #78716c;">Total Taxes (GST):</td>
        <td class="text-right" style="font-weight: 600;">₹${po.taxTotal.toLocaleString("en-IN")}</td>
      </tr>
      ${
        po.shippingFee > 0
          ? `<tr>
              <td style="color: #78716c;">Freight / Delivery:</td>
              <td class="text-right" style="font-weight: 600;">₹${po.shippingFee.toLocaleString("en-IN")}</td>
            </tr>`
          : ""
      }
      <tr class="grand-total">
        <td>GRAND TOTAL:</td>
        <td class="text-right">₹${po.grandTotal.toLocaleString("en-IN")}</td>
      </tr>
    </table>
  </div>

  ${
    po.notes
      ? `<div class="notes-box">
          <strong>Procurement Notes & Delivery Terms:</strong><br>
          ${po.notes}
        </div>`
      : ""
  }

  <div class="signatures">
    <div class="sign-line">
      Authorized Bakery Procurement Officer<br>
      <strong>${BUSINESS_CONFIG.billingName}</strong>
    </div>
    <div class="sign-line">
      Supplier Acknowledgment & Acceptance Signature<br>
      <strong>${po.supplier.name}</strong>
    </div>
  </div>

  <div class="footer">
    This Purchase Order is subject to standard bakery quality and food safety compliance. Send all invoices referencing this PO to ${BUSINESS_CONFIG.email}.
  </div>
</body>
</html>`;
}
