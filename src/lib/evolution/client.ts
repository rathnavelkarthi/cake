// Evolution API integration for Kichee's Baked Delights
// Sends order confirmations, UPI payment QR codes, kitchen status alerts, and customer login OTPs.

import { BUSINESS_CONFIG } from "@/lib/config/business";

export interface EvolutionSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function formatWhatsAppNumber(phone: string): string {
  // Strip non-numeric characters
  let cleaned = phone.replace(/\D/g, "");
  // If 10 digits (Indian standard), prepend 91
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  // If starts with 0 and has 11 digits
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = `91${cleaned.slice(1)}`;
  }
  return cleaned;
}

export async function sendWhatsAppMessage(
  phone: string,
  text: string
): Promise<EvolutionSendResult> {
  const apiUrl =
    process.env.EVOLUTION_API_URL ||
    "https://evolution-evolution-api.tn0bwj.easypanel.host";
  const apiKey = process.env.EVOLUTION_API_KEY || "Desmond@123";
  const instance = process.env.EVOLUTION_INSTANCE || "Cake";

  const targetNumber = formatWhatsAppNumber(phone);

  try {
    const res = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: targetNumber,
        text,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Evolution API sendText failed:", res.status, data);
      return { success: false, error: data?.response?.message || "Failed to send message" };
    }

    return {
      success: true,
      messageId: data?.key?.id || data?.messageId,
    };
  } catch (err: any) {
    console.error("Evolution API network error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function sendWhatsAppMedia(
  phone: string,
  mediaUrl: string,
  caption: string,
  fileName: string = "kichees-upi-qr.png"
): Promise<EvolutionSendResult> {
  const apiUrl =
    process.env.EVOLUTION_API_URL ||
    "https://evolution-evolution-api.tn0bwj.easypanel.host";
  const apiKey = process.env.EVOLUTION_API_KEY || "Desmond@123";
  const instance = process.env.EVOLUTION_INSTANCE || "Cake";

  const targetNumber = formatWhatsAppNumber(phone);

  try {
    const res = await fetch(`${apiUrl}/message/sendMedia/${instance}`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: targetNumber,
        mediatype: "image",
        mimetype: "image/png",
        caption,
        media: mediaUrl,
        fileName,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Evolution API sendMedia failed:", res.status, data);
      return { success: false, error: data?.response?.message || "Failed to send media" };
    }

    return {
      success: true,
      messageId: data?.key?.id || data?.messageId,
    };
  } catch (err: any) {
    console.error("Evolution API media error:", err.message);
    return { success: false, error: err.message };
  }
}

export function generateUpiDetails(orderNumber: string, amount: number) {
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "kichees@upi";
  const payeeName = process.env.NEXT_PUBLIC_UPI_NAME || BUSINESS_CONFIG.billingName;
  
  // Standard UPI URI format
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${orderNumber}`)}`;

  // High-res QR code image URL for scanning
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    upiUri
  )}&format=png&color=451a03&bgcolor=faf7f2`;

  return { upiId, payeeName, upiUri, qrImageUrl };
}

export async function sendOrderConfirmationWhatsApp(order: {
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  total: number;
  fulfilmentType: "PICKUP" | "DELIVERY";
  branchName?: string;
  branchAddress?: string;
  deliveryAddress?: string;
  deliveryDistanceKm?: number;
  deliveryFee?: number;
  items: string[];
}) {
  const { upiId, payeeName, upiUri, qrImageUrl } = generateUpiDetails(
    order.orderNumber,
    order.total
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kicheesbakeddelights.in";

  const fulfillmentDetails =
    order.fulfilmentType === "PICKUP"
      ? `📍 *Self-Collection / Counter Pickup:*\n🏢 ${order.branchName || "Kichee's Bakery"}\n📌 ${
          order.branchAddress || BUSINESS_CONFIG.address.full
        }`
      : `🚚 *Home Delivery across Chennai:*\n📌 Address: ${order.deliveryAddress || "As registered"}\n📏 Est. Distance: ${
          order.deliveryDistanceKm || "N/A"
        } km\n🛵 Delivery Charge: ${order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}`;

  const itemsList = order.items.map((item, idx) => `  ${idx + 1}. ${item}`).join("\n");

  const messageText = `🍰 *ORDER RECEIVED - KICHEE'S BAKED DELIGHTS*

Dear *${order.customerName}*, thank you for choosing Kichee's! We have logged your order and reserved kitchen capacity.

📋 *Order Details:*
• *Order Number:* ${order.orderNumber}
• *Total Payable:* ₹${order.total.toLocaleString("en-IN")}

🧁 *Items:*
${itemsList}

${fulfillmentDetails}

━━━━━━━━━━━━━━━━━━━━
💳 *PAYMENT INSTRUCTIONS (UPI)*
• *UPI ID:* \`${upiId}\`
• *Payee:* ${payeeName}
• *Amount:* ₹${order.total.toLocaleString("en-IN")}
• *Direct UPI Link:* ${upiUri}

📸 *NEXT STEP:*
Once payment is completed, *please reply to this message with your payment screenshot*!
Our manager will verify the transaction and immediately push your order to our chefs for baking.

Track your orders anytime:
👉 ${siteUrl}/orders
━━━━━━━━━━━━━━━━━━━━`;

  // Send ONE complete confirmation message (with QR image if supported, otherwise text)
  if (messageText.length <= 1024) {
    try {
      const mediaResult = await sendWhatsAppMedia(
        order.customerMobile,
        qrImageUrl,
        messageText,
        `order-${order.orderNumber}-upi.png`
      );
      if (mediaResult.success) {
        return { mediaResult, textResult: mediaResult };
      }
    } catch (err) {
      console.warn("Media WhatsApp send failed, falling back to text:", err);
    }
  }

  // Fallback or long message: send single text invoice with direct UPI link
  const textResult = await sendWhatsAppMessage(order.customerMobile, messageText);
  return { textResult };
}

export async function sendPaymentConfirmedWhatsApp(order: {
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  assignedChef?: string;
  fulfilmentType?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kicheesbakeddelights.in";

  const message = `✨ *PAYMENT CONFIRMED & PUSHED TO KITCHEN!*

Dear *${order.customerName}*, our manager has verified your UPI payment for Order *${order.orderNumber}*!

👩‍🍳 *Kitchen Update:*
Your order has been assigned to our baking station (${order.assignedChef || "Head Chef Selva & Confectionery Chef Anbu"}). The oven is preheating and artisanal decoration will begin promptly!

You can check real-time oven & decorating progress on your customer portal:
👉 ${siteUrl}/orders

Thank you for trusting Kichee's Baked Delights! ❤️`;

  return await sendWhatsAppMessage(order.customerMobile, message);
}

export async function sendCustomerOtpWhatsApp(phone: string, otp: string) {
  const message = `🔐 *Kichee's Baked Delights Login Code*

Your verification code is: *${otp}*

Enter this code on the website to view your past orders, active bakes, and tracking details.
This code will expire in 10 minutes.`;

  return await sendWhatsAppMessage(phone, message);
}

export async function sendKitchenStatusUpdateWhatsApp(order: {
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  stage: string;
  assignedChef?: string;
  fulfilmentType?: string;
  branchName?: string;
  deliveryAddress?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kicheesbakeddelights.in";
  let message = "";

  switch (order.stage) {
    case "IN_OVEN":
      message = `🔥 *IN THE OVEN - KICHEE'S BAKERY*

Hi *${order.customerName}*! Your order (*${order.orderNumber}*) is now inside the oven at our baking counter. 

Chef ${order.assignedChef?.includes("Selva") ? "Selva" : "Selva & team"} is baking it to golden perfection. Once rested and cooled, it heads straight to the artisan decorating table!

Track live bake status:
👉 ${siteUrl}/orders`;
      break;

    case "COOLING":
      message = `🌿 *FRESH OUT OF THE OVEN*

Hi *${order.customerName}*, your bake just finished in the oven! We're letting it rest on our marble cooling counter so the sponge sets with a tender crumb before delicate piping begins.`;
      break;

    case "DECORATING":
      message = `🎨 *DECORATING STATION - HANDCRAFTED FINISH*

Hi *${order.customerName}*! Your cake has moved to the decoration counter with Chef ${order.assignedChef?.includes("Anbu") ? "Anbu" : "Anbu & decorators"}.

We're piping the fresh frosting layers and handcrafted design details right now. It's looking beautiful! ✨

Track your bake:
👉 ${siteUrl}/orders`;
      break;

    case "READY":
    case "READY_FOR_PICKUP":
      if (order.fulfilmentType === "DELIVERY") {
        message = `✨ *QUALITY CHECK PASSED & PACKED!*

Dear *${order.customerName}*, your order (*${order.orderNumber}*) has passed chef inspection and is carefully packed in our temperature-controlled box! 

Our delivery driver is collecting it for dispatch. 🚗💨

Live tracker:
👉 ${siteUrl}/orders`;
      } else {
        message = `🎂 *READY FOR PICKUP AT THE COUNTER!*

Dear *${order.customerName}*, your cake (*${order.orderNumber}*) is freshly packaged and waiting for you!

📍 *Collection Point:* ${order.branchName || `Kichee's Bakery (${BUSINESS_CONFIG.address.full})`}
⏰ Feel free to pick it up anytime today. We can't wait to hand it over!

Live details:
👉 ${siteUrl}/orders`;
      }
      break;

    case "OUT_FOR_DELIVERY":
      message = `🛵 *OUT FOR DELIVERY - ON THE WAY!*

Hi *${order.customerName}*, your cake is in transit!

📌 *Delivery to:* ${order.deliveryAddress || "Your registered address"}
Please keep your phone handy for our driver. Handle with love and refrigerate upon arrival! 🍰`;
      break;

    case "COMPLETED":
      message = `🎉 *ENJOY YOUR CELEBRATION!*

Dear *${order.customerName}*, your order (*${order.orderNumber}*) is marked completed.

From our ovens to your celebrations, thank you for trusting Kichee's Baked Delights. We hope every slice brings joy! 

Tag us in your cake-cutting photos or reply with your feedback right here ❤️`;
      break;

    default:
      return null;
  }

  return await sendWhatsAppMessage(order.customerMobile, message);
}

// ----------------------------------------------------
// Purchase Order WhatsApp Dispatch (Evolution API)
// ----------------------------------------------------

export function generatePurchaseOrderWhatsAppText(po: {
  poNumber: string;
  date: string;
  expectedDeliveryDate?: string;
  deliveryLocation?: string;
  paymentTerms?: string;
  notes?: string;
  supplier: {
    name: string;
    contactPerson?: string;
    phone?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxTotal: number;
  shippingFee?: number;
  grandTotal: number;
}): string {
  const itemsText = (po.items || [])
    .map(
      (it, idx) =>
        `  ${idx + 1}. *${it.name}*\n     • Qty: ${it.quantity} ${it.unit} @ ₹${Number(it.unitPrice).toLocaleString("en-IN")}/${it.unit} = *₹${Number(it.totalPrice).toLocaleString("en-IN")}*`
    )
    .join("\n\n");

  return `📋 *OFFICIAL PURCHASE ORDER: ${po.poNumber}*
*${BUSINESS_CONFIG.billingName}* (${BUSINESS_CONFIG.name})

Dear *${po.supplier?.contactPerson || po.supplier?.name || "Vendor Partner"}*,

Please find our purchase order details below:

🏢 *Vendor:* ${po.supplier?.name || "Vendor Partner"}
📅 *PO Date:* ${po.date}
🚚 *Expected Delivery:* ${po.expectedDeliveryDate || "Earliest business dispatch"}
📍 *Delivery Destination:* ${po.deliveryLocation || BUSINESS_CONFIG.address.full}
💳 *Payment Terms:* ${po.paymentTerms || "Net 30 Days"}

━━━━━━━━━━━━━━━━━━━━
📦 *ORDERED MATERIALS / SUPPLIES:*
${itemsText}
━━━━━━━━━━━━━━━━━━━━

💰 *FINANCIAL SUMMARY:*
• Subtotal: ₹${Number(po.subtotal || 0).toLocaleString("en-IN")}
• Applicable GST: ₹${Number(po.taxTotal || 0).toLocaleString("en-IN")}
${po.shippingFee ? `• Freight / Shipping: ₹${Number(po.shippingFee).toLocaleString("en-IN")}\n` : ""}• *GRAND TOTAL: ₹${Number(po.grandTotal || 0).toLocaleString("en-IN")}*

${po.notes ? `📝 *Special Instructions / Notes:*\n${po.notes}\n\n` : ""}Kindly acknowledge receipt and confirm expected delivery dispatch.

*Procurement Desk - ${BUSINESS_CONFIG.billingName}*
📞 Phone: ${BUSINESS_CONFIG.phone}
✉️ Email: ${BUSINESS_CONFIG.email}`;
}

export async function sendPurchaseOrderWhatsApp(po: {
  poNumber: string;
  date: string;
  expectedDeliveryDate?: string;
  deliveryLocation?: string;
  paymentTerms?: string;
  notes?: string;
  supplier: {
    name: string;
    contactPerson?: string;
    phone?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxTotal: number;
  shippingFee?: number;
  grandTotal: number;
}, customPhone?: string): Promise<EvolutionSendResult> {
  const targetPhone = customPhone || po.supplier?.phone;
  if (!targetPhone) {
    return { success: false, error: "Supplier phone number is required" };
  }
  const message = generatePurchaseOrderWhatsAppText(po);
  return await sendWhatsAppMessage(targetPhone, message);
}

// ----------------------------------------------------
// POS / Billing Tax Invoice WhatsApp Dispatch
// ----------------------------------------------------

export function generateBillingInvoiceWhatsAppText(invoice: {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerMobile?: string;
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    isEggless?: boolean;
    notes?: string;
  }>;
  subtotal: number;
  tax: number;
  gstRate?: number;
  deliveryFee?: number;
  discount?: number;
  grandTotal: number;
}): string {
  const itemsText = (invoice.items || [])
    .map(
      (item) =>
        `• ${item.quantity}x ${item.name} (${item.isEggless !== false ? "100% Eggless" : "Standard"}) @ ₹${item.price} = *₹${item.price * item.quantity}*${
          item.notes ? `\n  _${item.notes}_` : ""
        }`
    )
    .join("\n");

  const lines = [
    `🍰 *${BUSINESS_CONFIG.billingName} - TAX INVOICE*`,
    `_${BUSINESS_CONFIG.name}_`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*Invoice Number:* #${invoice.invoiceNumber}`,
    `*Customer:* ${invoice.customerName}`,
    `*Date:* ${invoice.date}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*Ordered Items:*`,
    itemsText,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Subtotal: ₹${Number(invoice.subtotal || 0).toLocaleString("en-IN")}`,
    invoice.tax > 0 ? `GST (${invoice.gstRate || 5}%): ₹${Number(invoice.tax).toLocaleString("en-IN")}` : null,
    invoice.deliveryFee && invoice.deliveryFee > 0 ? `Delivery Fee: ₹${invoice.deliveryFee}` : null,
    invoice.discount && invoice.discount > 0 ? `Discount: -₹${invoice.discount}` : null,
    `*GRAND TOTAL: ₹${Number(invoice.grandTotal || 0).toLocaleString("en-IN")}*`,
    `*Payment Status:* PAID via ${invoice.paymentMethod}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Thank you for celebrating with ${BUSINESS_CONFIG.name}! 🎂`,
    `📍 ${BUSINESS_CONFIG.address.full}`,
    `📞 ${BUSINESS_CONFIG.phone}`,
  ].filter(Boolean);

  return lines.join("\n");
}

export async function sendBillingInvoiceWhatsApp(invoice: {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerMobile: string;
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    isEggless?: boolean;
    notes?: string;
  }>;
  subtotal: number;
  tax: number;
  gstRate?: number;
  deliveryFee?: number;
  discount?: number;
  grandTotal: number;
}): Promise<EvolutionSendResult> {
  const message = generateBillingInvoiceWhatsAppText(invoice);
  return await sendWhatsAppMessage(invoice.customerMobile, message);
}

// ----------------------------------------------------
// Bespoke Cake Quotation WhatsApp Dispatch
// ----------------------------------------------------

export function generateQuotationWhatsAppText(quote: {
  quotationNumber: string;
  customerName: string;
  occasion?: string;
  eventDate?: string;
  eventVenue?: string;
  validUntil?: string;
  paymentTerms?: string;
  specialInstructions?: string;
  items: Array<{
    name: string;
    description?: string;
    flavour?: string;
    weightKg?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isEggless?: boolean;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee?: number;
  setupFee?: number;
  discount?: number;
  grandTotal: number;
  advanceAmount?: number;
}): string {
  const itemsText = (quote.items || [])
    .map(
      (it, idx) =>
        `  ${idx + 1}. *${it.name || "Bespoke Celebration Cake"}* (${it.weightKg || "Custom"} • ${it.flavour || "Selected flavour"})\n     • Qty: ${it.quantity} @ ₹${Number(it.unitPrice).toLocaleString("en-IN")} = *₹${Number(it.totalPrice).toLocaleString("en-IN")}*${
          it.description ? `\n     _${it.description}_` : ""
        }`
    )
    .join("\n\n");

  const lines = [
    `✨ *BESPOKE CELEBRATION QUOTATION*`,
    `*${BUSINESS_CONFIG.billingName}* (${BUSINESS_CONFIG.name})`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*Quotation Ref:* ${quote.quotationNumber}`,
    `*Client:* ${quote.customerName}`,
    quote.occasion ? `*Occasion:* ${quote.occasion}` : null,
    quote.eventDate ? `*Event Date:* ${quote.eventDate}` : null,
    quote.eventVenue ? `*Venue:* ${quote.eventVenue}` : null,
    quote.validUntil ? `*Valid Until:* ${quote.validUntil}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🎂 *ESTIMATED CREATIONS:*`,
    itemsText,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Subtotal: ₹${Number(quote.subtotal || 0).toLocaleString("en-IN")}`,
    quote.tax > 0 ? `GST: ₹${Number(quote.tax).toLocaleString("en-IN")}` : null,
    quote.setupFee && quote.setupFee > 0 ? `Venue Setup & Structural Support: ₹${quote.setupFee}` : null,
    quote.deliveryFee && quote.deliveryFee > 0 ? `Cold Storage Delivery: ₹${quote.deliveryFee}` : null,
    quote.discount && quote.discount > 0 ? `Special Discount: -₹${quote.discount}` : null,
    `*ESTIMATED TOTAL: ₹${Number(quote.grandTotal || 0).toLocaleString("en-IN")}*`,
    quote.advanceAmount && quote.advanceAmount > 0
      ? `*Advance Required to Confirm Kitchen Slot:* ₹${Number(quote.advanceAmount).toLocaleString("en-IN")}`
      : null,
    quote.paymentTerms ? `\n💳 *Payment Terms:*\n${quote.paymentTerms}` : null,
    quote.specialInstructions ? `\n📝 *Notes:*\n${quote.specialInstructions}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `To accept this quote or request changes, reply directly to this message!`,
    `📞 ${BUSINESS_CONFIG.phone} | ✉️ ${BUSINESS_CONFIG.email}`,
  ].filter(Boolean);

  return lines.join("\n");
}

export async function sendQuotationWhatsApp(quote: {
  quotationNumber: string;
  customerName: string;
  customerMobile: string;
  occasion?: string;
  eventDate?: string;
  eventVenue?: string;
  validUntil?: string;
  paymentTerms?: string;
  specialInstructions?: string;
  items: Array<{
    name: string;
    description?: string;
    flavour?: string;
    weightKg?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isEggless?: boolean;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee?: number;
  setupFee?: number;
  discount?: number;
  grandTotal: number;
  advanceAmount?: number;
}): Promise<EvolutionSendResult> {
  const message = generateQuotationWhatsAppText(quote);
  return await sendWhatsAppMessage(quote.customerMobile, message);
}

