import { BUSINESS_CONFIG } from "@/lib/config/business";
import { addOrder } from "@/lib/orders/order-store";

export interface QuotationLineItem {
  id: string;
  name: string;
  description?: string;
  flavour?: string;
  weightKg?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isEggless?: boolean;
  category?: string;
}

export type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "APPROVED"
  | "CONVERTED"
  | "REJECTED"
  | "EXPIRED";

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  occasion: string;
  eventDate: string;
  eventVenue?: string;
  validUntil: string;
  date: string;
  items: QuotationLineItem[];
  subtotal: number;
  includeGst: boolean;
  gstRate: number; // e.g. 5%
  tax: number;
  deliveryFee: number;
  setupFee: number;
  discount: number;
  grandTotal: number;
  advanceRequiredPercentage: number;
  advanceAmount: number;
  status: QuotationStatus;
  specialInstructions?: string;
  paymentTerms?: string;
  convertedOrderNumber?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "kichees_quotations_v1";

const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: "qt-101",
    quotationNumber: "QT-2026-0081",
    customerName: "Priya Sundaram",
    customerMobile: "+91 98402 44123",
    customerEmail: "priya.sundaram@gmail.com",
    occasion: "Wedding Reception",
    eventDate: "2026-10-18",
    eventVenue: "Mayor Ramanathan Chettiar Hall, MRC Nagar, Chennai",
    validUntil: "2026-10-12",
    date: "2026-10-01",
    items: [
      {
        id: "qi-1",
        name: "3-Tier Bespoke Floral Wedding Gateau",
        description: "Base: 3 KG Callebaut Dark Truffle; Middle: 2 KG Hazelnut Praline; Top: 1 KG Madagascar Vanilla Bean. Handcrafted wafer paper florals & 24K edible gold flakes.",
        flavour: "Dark Belgian Chocolate & Roasted Hazelnut",
        weightKg: "6.0 KG",
        quantity: 1,
        unitPrice: 14500,
        totalPrice: 14500,
        isEggless: true,
        category: "Tiered Celebration Cakes",
      },
      {
        id: "qi-2",
        name: "On-Site Stacking, Floral Dressing & Tier Support System",
        description: "Specialized food-grade acrylic dowel system and delivery van temperature monitoring + pastry chef venue assembly.",
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500,
        category: "Venue Setup & Logistics",
      },
    ],
    subtotal: 16000,
    includeGst: true,
    gstRate: 5,
    tax: 800,
    deliveryFee: 400,
    setupFee: 0,
    discount: 500,
    grandTotal: 16700,
    advanceRequiredPercentage: 50,
    advanceAmount: 8350,
    status: "APPROVED",
    specialInstructions: "Delivery strictly between 3:30 PM - 4:15 PM before stage photography commences. Keep cake in air-conditioned pre-function area.",
    paymentTerms: "50% advance required upon quote approval to block kitchen slot. Balance payable upon delivery setup.",
    createdAt: "2026-10-01T10:30:00.000Z",
    updatedAt: "2026-10-01T16:20:00.000Z",
  },
  {
    id: "qt-102",
    quotationNumber: "QT-2026-0082",
    customerName: "Karthik Venkatraman (Cognizant HR)",
    customerMobile: "+91 97910 55432",
    customerEmail: "karthik.venkatraman@cognizant.com",
    occasion: "Corporate Diwali & Gifting Hampers",
    eventDate: "2026-10-25",
    eventVenue: "Cognizant Technology Solutions, MEPZ, Tambaram, Chennai",
    validUntil: "2026-10-15",
    date: "2026-10-02",
    items: [
      {
        id: "qi-3",
        name: "Executive Patisserie Gift Box (Pack of 45)",
        description: "Each luxury gold-embossed box contains 2x Salted Caramel Brownies, 2x Valrhona Chocolate Madeleines, and 1 jar of Pistachio Shortbread Cookies with custom company sleeve branding.",
        flavour: "Assorted Patisserie",
        quantity: 45,
        unitPrice: 650,
        totalPrice: 29250,
        isEggless: true,
        category: "Corporate Hampers",
      },
    ],
    subtotal: 29250,
    includeGst: true,
    gstRate: 5,
    tax: 1462.5,
    deliveryFee: 600,
    setupFee: 0,
    discount: 1500,
    grandTotal: 29812.5,
    advanceRequiredPercentage: 50,
    advanceAmount: 14906,
    status: "SENT",
    specialInstructions: "Company PO number to be attached on delivery challan. Individual ribbon tying per box.",
    paymentTerms: "50% Advance via Corporate NEFT/RTGS. Remaining 50% on delivery against GST invoice.",
    createdAt: "2026-10-02T09:15:00.000Z",
    updatedAt: "2026-10-02T09:15:00.000Z",
  },
  {
    id: "qt-103",
    quotationNumber: "QT-2026-0083",
    customerName: "Ananya Narayanan",
    customerMobile: "+91 98840 91823",
    customerEmail: "ananya.n@gmail.com",
    occasion: "Baby's 1st Birthday",
    eventDate: "2026-10-22",
    eventVenue: "Crowne Plaza Adyar Park / Residence, RA Puram, Chennai",
    validUntil: "2026-10-14",
    date: "2026-10-02",
    items: [
      {
        id: "qi-4",
        name: "Pastel Teddy Bear & Woodland Carousel Cake (2 Tiers)",
        description: "Lower tier (1.5 KG Biscoff Caramel), Upper tier (1 KG Belgian Milk Chocolate). Fondant woodland animal sculptures with hand-piped cloud buttercream borders.",
        flavour: "Lotus Biscoff & Belgian Milk Chocolate",
        weightKg: "2.5 KG",
        quantity: 1,
        unitPrice: 5800,
        totalPrice: 5800,
        isEggless: true,
        category: "Kids Celebration Theme",
      },
      {
        id: "qi-5",
        name: "Themed Fondant Cupcakes (Box of 12)",
        description: "Matching woodland baby shower cupcakes with buttercream swirl and custom edible initials.",
        quantity: 2,
        unitPrice: 1200,
        totalPrice: 2400,
        isEggless: true,
        category: "Cupcakes",
      },
    ],
    subtotal: 8200,
    includeGst: true,
    gstRate: 5,
    tax: 410,
    deliveryFee: 150,
    setupFee: 0,
    discount: 0,
    grandTotal: 8760,
    advanceRequiredPercentage: 50,
    advanceAmount: 4380,
    status: "DRAFT",
    specialInstructions: "Colors should be soft beige, sage green and buttercup yellow. No artificial blue food coloring.",
    paymentTerms: "50% advance to confirm date slot.",
    createdAt: "2026-10-02T11:45:00.000Z",
    updatedAt: "2026-10-02T11:45:00.000Z",
  },
];

let inMemoryQuotations: Quotation[] = [...INITIAL_QUOTATIONS];
let subscribers: Array<(quotes: Quotation[]) => void> = [];

function notifySubscribers() {
  subscribers.forEach((sub) => {
    try {
      sub([...inMemoryQuotations]);
    } catch (err) {
      console.error("Quotation subscriber error:", err);
    }
  });
}

function loadFromStorage(): Quotation[] {
  if (typeof window === "undefined") {
    return inMemoryQuotations;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryQuotations = parsed;
        return inMemoryQuotations;
      }
    }
    // initialize storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryQuotations));
  } catch (e) {
    console.warn("Could not read quotations from localStorage", e);
  }
  return inMemoryQuotations;
}

function saveToStorage() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryQuotations));
    } catch (e) {
      console.warn("Could not save quotations to localStorage", e);
    }
  }
  notifySubscribers();
}

export function getQuotations(): Quotation[] {
  return loadFromStorage();
}

export function getQuotationById(id: string): Quotation | undefined {
  const all = getQuotations();
  return all.find((q) => q.id === id || q.quotationNumber === id);
}

export function createQuotation(
  data: Omit<Quotation, "id" | "quotationNumber" | "createdAt" | "updatedAt"> & {
    quotationNumber?: string;
  }
): Quotation {
  loadFromStorage();
  const nextNum = inMemoryQuotations.length + 84;
  const quoteNumber =
    data.quotationNumber || `QT-2026-${String(nextNum).padStart(4, "0")}`;
  const now = new Date().toISOString();

  const newQuote: Quotation = {
    ...data,
    id: `qt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    quotationNumber: quoteNumber,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryQuotations = [newQuote, ...inMemoryQuotations];
  saveToStorage();
  return newQuote;
}

export function updateQuotation(
  id: string,
  updates: Partial<Quotation>
): Quotation | undefined {
  loadFromStorage();
  const idx = inMemoryQuotations.findIndex((q) => q.id === id);
  if (idx === -1) return undefined;

  const updated: Quotation = {
    ...inMemoryQuotations[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  inMemoryQuotations[idx] = updated;
  saveToStorage();
  return updated;
}

export function updateQuotationStatus(
  id: string,
  status: QuotationStatus
): Quotation | undefined {
  return updateQuotation(id, { status });
}

export function deleteQuotation(id: string): boolean {
  loadFromStorage();
  const initialLen = inMemoryQuotations.length;
  inMemoryQuotations = inMemoryQuotations.filter((q) => q.id !== id);
  if (inMemoryQuotations.length !== initialLen) {
    saveToStorage();
    return true;
  }
  return false;
}

export function subscribeQuotations(
  listener: (quotes: Quotation[]) => void
): () => void {
  subscribers.push(listener);
  // initial call
  listener(getQuotations());
  return () => {
    subscribers = subscribers.filter((s) => s !== listener);
  };
}

/**
 * Converts an approved quotation directly into an official bakery order in the order store
 */
export function convertQuotationToOrder(
  quotationId: string
): { success: boolean; orderNumber?: string; error?: string } {
  loadFromStorage();
  const quote = inMemoryQuotations.find((q) => q.id === quotationId);
  if (!quote) {
    return { success: false, error: "Quotation not found" };
  }

  // Generate order number
  const orderNumber = `KCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const itemNames = quote.items.map(
    (item) => `${item.quantity}x ${item.name}${item.weightKg ? ` (${item.weightKg})` : ""}`
  );

  // Add into order store
  addOrder({
    orderNumber,
    customerName: quote.customerName,
    customerMobile: quote.customerMobile,
    customerEmail: quote.customerEmail,
    total: quote.grandTotal,
    paymentStatus: quote.status === "APPROVED" ? "PAID" : "PENDING",
    orderStatus: "CONFIRMED",
    fulfilmentType: quote.deliveryFee > 0 ? "DELIVERY" : "PICKUP",
    deliveryAddress: quote.eventVenue,
    deliveryFee: quote.deliveryFee,
    itemsCount: quote.items.reduce((acc, curr) => acc + curr.quantity, 0),
    deliveryDate: quote.eventDate,
    deliveryTimeSlot: "2:00 PM - 5:00 PM",
    flavour: quote.items[0]?.flavour || "Artisanal Selection",
    weightKg: quote.items[0]?.weightKg || "Custom Tier",
    isEggless: quote.items.every((i) => i.isEggless !== false),
    isInstantOrder: false,
    notes: `Converted from Quotation ${quote.quotationNumber} (${quote.occasion}). Advance required: ₹${quote.advanceAmount}. Special note: ${quote.specialInstructions || "None"}`,
    items: itemNames,
  });

  // Mark quote as CONVERTED
  updateQuotation(quotationId, {
    status: "CONVERTED",
    convertedOrderNumber: orderNumber,
  });

  return { success: true, orderNumber };
}

/**
 * Generate WhatsApp share message and link
 */
export function getWhatsAppShareUrl(quote: Quotation): string {
  const cleanPhone = quote.customerMobile.replace(/[^0-9]/g, "");
  const targetPhone = cleanPhone.startsWith("91")
    ? cleanPhone
    : `91${cleanPhone.replace(/^0+/, "")}`;

  const message = `Dear *${quote.customerName}*,

Greetings from *${BUSINESS_CONFIG.name}*, Nungambakkam! 🎂

Thank you for inquiring with us for your *${quote.occasion}* on *${quote.eventDate}*. Here is your official quotation:

📄 *Quotation Ref:* ${quote.quotationNumber}
🗓 *Valid Until:* ${quote.validUntil}
📍 *Event Venue:* ${quote.eventVenue || "Counter Pickup / To be confirmed"}

*Estimated Items:*
${quote.items.map((it, idx) => `${idx + 1}. ${it.name} (Qty: ${it.quantity}) - ₹${it.totalPrice.toLocaleString("en-IN")}`).join("\n")}

*Financial Summary:*
• Subtotal: ₹${quote.subtotal.toLocaleString("en-IN")}
${quote.includeGst ? `• GST (${quote.gstRate}%): ₹${quote.tax.toLocaleString("en-IN")}\n` : ""}${quote.deliveryFee > 0 ? `• Delivery/Logistics: ₹${quote.deliveryFee.toLocaleString("en-IN")}\n` : ""}${quote.discount > 0 ? `• Privilege Discount: -₹${quote.discount.toLocaleString("en-IN")}\n` : ""}⭐ *Grand Total:* ₹${quote.grandTotal.toLocaleString("en-IN")}
🔒 *Advance to Confirm Booking (50%):* ₹${quote.advanceAmount.toLocaleString("en-IN")}

*Payment Mode (UPI):*
UPI ID: \`kichees.pay@okhdfcbank\`
GPay / PhonePe: ${BUSINESS_CONFIG.phoneDisplay}

Please reply with "CONFIRM" or share your payment screenshot to reserve our kitchen's baking schedule.

Warm regards,
*Selva & Pastry Team*
${BUSINESS_CONFIG.name} · Chennai
${BUSINESS_CONFIG.address.full}`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates an isolated, print-ready A4 HTML document for Quotation PDF export
 */
export function generateQuotationHtml(quote: Quotation): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Quotation - ${quote.quotationNumber} - ${BUSINESS_CONFIG.name}</title>
  <style>
    @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { color: #1c1917; font-size: 13px; line-height: 1.5; background: #fff; padding: 10px; }
    
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 18px; border-bottom: 2px solid #78350f; margin-bottom: 20px; }
    .brand-title { font-size: 24px; font-weight: 800; color: #78350f; letter-spacing: -0.5px; }
    .brand-sub { font-size: 12px; color: #78716c; font-weight: 500; margin-top: 2px; }
    .brand-contact { font-size: 11px; color: #57534e; margin-top: 6px; line-height: 1.4; max-width: 320px; }
    
    .doc-meta { text-align: right; }
    .doc-badge { display: inline-block; background: #fef3c7; color: #92400e; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .doc-number { font-size: 18px; font-weight: 800; color: #1c1917; }
    .doc-date { font-size: 11.5px; color: #78716c; margin-top: 2px; }
    
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 14px 18px; margin-bottom: 22px; }
    .details-col h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #a8a29e; margin-bottom: 6px; }
    .details-col p { font-size: 12.5px; color: #292524; font-weight: 500; margin-bottom: 3px; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead tr { background: #78350f; color: #fff; }
    th { padding: 9px 12px; font-size: 11.5px; font-weight: 600; text-align: left; }
    th.text-right, td.text-right { text-align: right; }
    th.text-center, td.text-center { text-align: center; }
    tbody tr { border-bottom: 1px solid #e7e5e4; }
    tbody tr:nth-child(even) { background: #fafaf9; }
    td { padding: 10px 12px; font-size: 12px; vertical-align: top; color: #292524; }
    
    .item-name { font-weight: 700; color: #1c1917; font-size: 12.5px; }
    .item-desc { font-size: 11px; color: #57534e; margin-top: 2px; line-height: 1.35; }
    .item-tag { display: inline-block; font-size: 9.5px; font-weight: 700; background: #e7e5e4; color: #44403c; padding: 2px 6px; border-radius: 4px; margin-top: 3px; }
    .item-tag.veg { background: #dcfce7; color: #166534; }
    
    .summary-section { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 22px; }
    .terms-box { flex: 1; border: 1px dashed #d6d3d1; background: #fdf8f6; border-radius: 8px; padding: 12px 16px; font-size: 11px; color: #57534e; line-height: 1.45; }
    .terms-box h4 { font-size: 11.5px; font-weight: 700; color: #78350f; margin-bottom: 6px; }
    
    .totals-box { width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; color: #57534e; }
    .totals-row.grand { border-top: 2px solid #78350f; border-bottom: 2px solid #78350f; padding: 8px 0; margin-top: 6px; font-size: 15px; font-weight: 800; color: #78350f; }
    .totals-row.advance { background: #fef3c7; color: #92400e; font-weight: 700; padding: 6px 8px; border-radius: 6px; margin-top: 8px; }
    
    .bank-box { border: 1px solid #e7e5e4; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 11px; background: #fff; }
    .bank-box h4 { font-size: 11px; font-weight: 700; color: #292524; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    
    .footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 20px; border-top: 1px solid #e7e5e4; font-size: 10.5px; color: #78716c; }
    .sign-box { text-align: center; width: 180px; }
    .sign-line { border-bottom: 1px solid #a8a29e; height: 35px; margin-bottom: 4px; }
    
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand-title">${BUSINESS_CONFIG.name}</div>
      <div class="brand-sub">${BUSINESS_CONFIG.tagline}</div>
      <div class="brand-contact">
        ${BUSINESS_CONFIG.address.full}<br>
        <strong>GSTIN:</strong> ${BUSINESS_CONFIG.taxIdentity.gstin} · <strong>FSSAI:</strong> 12423002001550<br>
        <strong>Phone / WhatsApp:</strong> ${BUSINESS_CONFIG.phoneDisplay} · ${BUSINESS_CONFIG.email}
      </div>
    </div>
    <div class="doc-meta">
      <div class="doc-badge">${quote.status}</div>
      <div class="doc-number">${quote.quotationNumber}</div>
      <div class="doc-date"><strong>Date:</strong> ${quote.date}</div>
      <div class="doc-date"><strong>Valid Until:</strong> ${quote.validUntil}</div>
    </div>
  </div>

  <!-- Client & Event Info -->
  <div class="details-grid">
    <div class="details-col">
      <h4>Quotation Prepared For</h4>
      <p><strong>${quote.customerName}</strong></p>
      <p>📞 ${quote.customerMobile}</p>
      ${quote.customerEmail ? `<p>✉️ ${quote.customerEmail}</p>` : ""}
    </div>
    <div class="details-col">
      <h4>Celebration & Event Details</h4>
      <p><strong>Occasion:</strong> ${quote.occasion}</p>
      <p><strong>Event Date:</strong> ${quote.eventDate}</p>
      <p><strong>Venue / Destination:</strong> ${quote.eventVenue || "Counter Pickup, Nungambakkam"}</p>
    </div>
  </div>

  <!-- Line Items Table -->
  <table>
    <thead>
      <tr>
        <th style="width: 48%;">Description / Specifications</th>
        <th class="text-center" style="width: 14%;">Weight / Tiers</th>
        <th class="text-center" style="width: 10%;">Qty</th>
        <th class="text-right" style="width: 14%;">Rate (₹)</th>
        <th class="text-right" style="width: 14%;">Total (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${quote.items
        .map(
          (item) => `
        <tr>
          <td>
            <div class="item-name">${item.name}</div>
            ${item.description ? `<div class="item-desc">${item.description}</div>` : ""}
            <div style="margin-top: 3px;">
              ${item.isEggless !== false ? `<span class="item-tag veg">100% EGGLESS</span>` : `<span class="item-tag">CONTAINS EGG</span>`}
              ${item.flavour ? `<span class="item-tag">Flavour: ${item.flavour}</span>` : ""}
            </div>
          </td>
          <td class="text-center">${item.weightKg || "—"}</td>
          <td class="text-center" style="font-weight: 700;">${item.quantity}</td>
          <td class="text-right">${item.unitPrice.toLocaleString("en-IN")}</td>
          <td class="text-right" style="font-weight: 700;">${item.totalPrice.toLocaleString("en-IN")}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <!-- Financial Summary & Terms -->
  <div class="summary-section">
    <div class="terms-box">
      <h4>Order Terms & Custom Cake Care</h4>
      <p>• <strong>Advance:</strong> A minimum of ${quote.advanceRequiredPercentage}% deposit (₹${quote.advanceAmount.toLocaleString("en-IN")}) is required to block bakery kitchen slots and source specialty ingredients.</p>
      <p>• <strong>Transport & Care:</strong> Cakes should be transported flat in an air-conditioned car. Keep refrigerated at 4°C - 8°C and bring to ambient temperature 20 minutes before ceremonial cutting.</p>
      <p>• <strong>Cancellation:</strong> Custom tiered cakes require minimum 72 hours prior notice for postponement or cancellation.</p>
      ${quote.specialInstructions ? `<p style="margin-top: 6px;"><strong>Special Note:</strong> ${quote.specialInstructions}</p>` : ""}
    </div>

    <div class="totals-box">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>₹${quote.subtotal.toLocaleString("en-IN")}</span>
      </div>
      ${
        quote.includeGst
          ? `
      <div class="totals-row">
        <span>GST (${quote.gstRate}%)</span>
        <span>₹${quote.tax.toLocaleString("en-IN")}</span>
      </div>`
          : ""
      }
      ${
        quote.deliveryFee > 0
          ? `
      <div class="totals-row">
        <span>Delivery & Logistics</span>
        <span>₹${quote.deliveryFee.toLocaleString("en-IN")}</span>
      </div>`
          : ""
      }
      ${
        quote.setupFee > 0
          ? `
      <div class="totals-row">
        <span>Venue Setup & Tier Dowel</span>
        <span>₹${quote.setupFee.toLocaleString("en-IN")}</span>
      </div>`
          : ""
      }
      ${
        quote.discount > 0
          ? `
      <div class="totals-row" style="color: #166534;">
        <span>Privilege Discount</span>
        <span>-₹${quote.discount.toLocaleString("en-IN")}</span>
      </div>`
          : ""
      }
      <div class="totals-row grand">
        <span>Grand Total</span>
        <span>₹${quote.grandTotal.toLocaleString("en-IN")}</span>
      </div>
      <div class="totals-row advance">
        <span>Advance to Confirm (${quote.advanceRequiredPercentage}%)</span>
        <span>₹${quote.advanceAmount.toLocaleString("en-IN")}</span>
      </div>
    </div>
  </div>

  <!-- Bank / UPI Payment Transfer Details -->
  <div class="bank-box">
    <h4>Bank & UPI Payment Details for Advance Transfer</h4>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 4px;">
      <div><strong>UPI ID:</strong> kichees.pay@okhdfcbank</div>
      <div><strong>GPay / PhonePe:</strong> ${BUSINESS_CONFIG.phoneDisplay}</div>
      <div><strong>Beneficiary:</strong> Kichees Baked Delights</div>
    </div>
  </div>

  <!-- Signatory & Footer -->
  <div class="footer">
    <div>
      This is an official commercial quotation generated by Kichees Baked Delights.<br>
      For questions or revisions, please call <strong>${BUSINESS_CONFIG.phoneDisplay}</strong> or WhatsApp us directly.
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div>Authorized Signatory</div>
      <div style="font-weight: 700; color: #78350f;">Kichees Baked Delights</div>
    </div>
  </div>
</body>
</html>`;
}
