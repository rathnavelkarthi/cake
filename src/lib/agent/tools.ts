import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendWhatsAppMessage, formatWhatsAppNumber } from "@/lib/evolution/client";
import { sendEmail } from "@/lib/email/mailer";
import { BUSINESS_CONFIG } from "@/lib/config/business";
import { getAbandonedCartSessions, sendCartReminderWhatsApp } from "@/lib/cart/session-store";

export interface OrderStatusResult {
  found: boolean;
  orderNumber?: string;
  customerName?: string;
  orderStatus?: string;
  fulfilmentType?: string;
  branchName?: string;
  deliveryAddress?: string;
  itemsSummary?: string;
  total?: number;
  voiceSummary: string;
  whatsappSent?: boolean;
}

/**
 * Searches orders by phone or order number and creates natural spoken text for the voice agent
 */
export async function lookupOrderStatus(params: {
  phone?: string;
  orderNumber?: string;
  triggerWhatsApp?: boolean;
}): Promise<OrderStatusResult> {
  const { phone, orderNumber, triggerWhatsApp = false } = params;

  if (!phone && !orderNumber) {
    return {
      found: false,
      voiceSummary: "I could not find an order because no phone number or order number was provided.",
    };
  }

  let query = supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (orderNumber) {
    query = query.eq("order_number", orderNumber.trim());
  } else if (phone) {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    query = query.ilike("customer_mobile", `%${cleanPhone}%`);
  }

  const { data, error } = await query;
  const order = data && data.length > 0 ? data[0] : null;

  if (error || !order) {
    return {
      found: false,
      voiceSummary: `I searched our kitchen log, but could not find an active order matching ${
        orderNumber ? `order number ${orderNumber}` : `phone number ${phone}`
      }. Please confirm the number or let me know if you would like me to connect you with our baking manager.`,
    };
  }

  // Parse items
  let itemsListText = "your bakery items";
  if (Array.isArray(order.items) && order.items.length > 0) {
    itemsListText = order.items
      .map((i: any) => `${i.quantity || 1}x ${i.name}`)
      .join(", ");
  }

  // Map status to natural spoken phrases
  let statusSpoken = "being reviewed by our baking team";
  const rawStatus = (order.order_status || "PENDING").toUpperCase();

  switch (rawStatus) {
    case "PENDING":
      statusSpoken = "logged in our system and awaiting payment confirmation";
      break;
    case "CONFIRMED":
      statusSpoken = "confirmed and scheduled in Chef Selva's bake roster";
      break;
    case "PREPARING":
    case "BAKING":
      statusSpoken = "actively being baked and frosted by our pastry chefs in Nungambakkam";
      break;
    case "READY_FOR_PICKUP":
      statusSpoken = `neatly packaged and ready for counter pickup at our ${order.branch_name || "Nungambakkam"} outlet`;
      break;
    case "DISPATCHED":
      statusSpoken = "out for delivery in our temperature-controlled chilled van";
      break;
    case "DELIVERED":
      statusSpoken = "delivered and completed";
      break;
    case "CANCELLED":
      statusSpoken = "cancelled";
      break;
  }

  const customerGreeting = order.customer_name ? `Hi ${order.customer_name}, ` : "";
  const destination = order.fulfilment_type === "PICKUP"
    ? `pickup at ${order.branch_name || "our Nungambakkam kitchen"}`
    : `delivery to ${order.delivery_address || "your address"}`;

  const voiceSummary = `${customerGreeting}I found order #${order.order_number} for ${itemsListText}. It is currently ${statusSpoken}, scheduled for ${destination}. The total amount is ₹${Number(order.total || 0).toLocaleString("en-IN")}.`;

  let whatsappSent = false;
  if (triggerWhatsApp && order.customer_mobile) {
    const trackingMessage = `Hello ${order.customer_name || "Customer"}! 🎂

Here is your live order update from *Kichee's Baked Delights*:

📦 *Order:* #${order.order_number}
🍰 *Items:* ${itemsListText}
📍 *Status:* ${rawStatus} (${statusSpoken})
🚚 *Fulfilment:* ${order.fulfilment_type === "PICKUP" ? "Store Pickup" : "Chilled Doorstep Delivery"}
${order.delivery_address ? `🏠 *Address:* ${order.delivery_address}` : ""}

If you need urgent assistance, call our Baking Desk directly at ${BUSINESS_CONFIG.phoneDisplay}.

— Kichee's Baking Desk, Nungambakkam`;

    const wa = await sendWhatsAppMessage(order.customer_mobile, trackingMessage);
    whatsappSent = Boolean(wa.success);
  }

  return {
    found: true,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    orderStatus: rawStatus,
    fulfilmentType: order.fulfilment_type,
    branchName: order.branch_name,
    deliveryAddress: order.delivery_address,
    itemsSummary: itemsListText,
    total: Number(order.total || 0),
    voiceSummary,
    whatsappSent,
  };
}

export interface CustomCakeLeadInput {
  customerPhone: string;
  customerName?: string;
  customerEmail?: string;
  occasion?: string;
  eventDate?: string;
  guestCount?: number | string;
  flavourPreference?: string;
  budget?: number | string;
  locality?: string;
  notes?: string;
  sendWhatsAppImagePrompt?: boolean;
}

/**
 * Logs a custom cake quotation inquiry, sends a WhatsApp image upload prompt to caller,
 * and notifies the owner by email.
 */
export async function intakeCustomCakeLead(input: CustomCakeLeadInput) {
  const {
    customerPhone,
    customerName = "Customer",
    customerEmail,
    occasion = "Celebration",
    eventDate = "Upcoming date",
    guestCount,
    flavourPreference,
    budget,
    locality,
    notes,
    sendWhatsAppImagePrompt = true,
  } = input;

  if (!customerPhone) {
    throw new Error("Customer phone number is required.");
  }

  const quoteId = `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Try to record in Supabase quotations or quotation_leads table
  try {
    await supabaseAdmin.from("quotations").insert({
      id: quoteId,
      quotation_number: quoteId,
      customer_name: customerName,
      customer_mobile: customerPhone,
      customer_email: customerEmail || null,
      occasion,
      event_date: eventDate,
      event_venue: locality || "Chennai",
      special_instructions: `Guest count: ${guestCount || "N/A"} | Flavours: ${flavourPreference || "Custom"} | Budget: ${budget || "Standard"} | Notes: ${notes || "None"}`,
      status: "DRAFT",
      grand_total: Number(budget) || 0,
      created_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn("Could not insert into quotations table (non-fatal):", err.message);
  }

  // 2. Send instant WhatsApp prompt for reference photos
  let whatsappSent = false;
  if (sendWhatsAppImagePrompt) {
    const waText = `Hi ${customerName}! 🎂

Thank you for contacting *Kichee's Baked Delights* regarding your bespoke cake for *${occasion}* on *${eventDate}*!

📸 *Next Step - Send your cake design inspirations:*
Please reply directly to this WhatsApp chat with:
1. Any reference pictures, sketches, or Pinterest photos you like
2. Desired color scheme & custom name/message on the cake

Chef Selva will review your brief and send you a custom cake sketch and exact pricing within 30 minutes!

— Kichee's Bespoke Gateaux Desk, Nungambakkam
📞 ${BUSINESS_CONFIG.phoneDisplay}`;

    const waRes = await sendWhatsAppMessage(customerPhone, waText);
    whatsappSent = Boolean(waRes.success);
  }

  // 3. Send email alert to bakery owner via Hostinger SMTP
  const ownerEmail = process.env.SMTP_USER || "billing@kicheesbakeddelights.in";
  try {
    await sendEmail({
      to: ownerEmail,
      subject: `🎂 [NEW CUSTOM CAKE LEAD #${quoteId}] ${occasion} on ${eventDate} (${customerName})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #222; border: 1px solid #e0d5c1; border-radius: 12px; padding: 24px; background: #fffcf9;">
          <h2 style="color: #4a2c11; margin-top: 0;">New Custom Cake Quotation Lead</h2>
          <p>The AI voice agent captured a new custom cake inquiry. Follow up or check WhatsApp for incoming reference photos.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 18px 0;">
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Quote ID</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${quoteId}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Customer Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${customerName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${customerPhone}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Occasion</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${occasion}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Event Date</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${eventDate}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Guest Count</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${guestCount || "Not specified"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Flavour Preference</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${flavourPreference || "Chef recommendation"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Target Locality</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${locality || "Chennai"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Budget Indication</td><td style="padding: 8px; border-bottom: 1px solid #eee;">₹${budget || "Open"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Notes</td><td style="padding: 8px;">${notes || "None"}</td></tr>
          </table>
          <p style="font-size: 13px; color: #777;">Kichee's Baked Delights • Nungambakkam, Chennai</p>
        </div>
      `,
    });
  } catch (mailErr) {
    console.warn("Owner alert email failed (non-fatal):", mailErr);
  }

  const voiceSummary = `I have logged your custom cake request for ${occasion} on ${eventDate}. I just sent a WhatsApp message to your phone. Please reply to that WhatsApp chat with any photos, sketches, or color palettes you like, and Chef Selva will review your brief and send your custom sketch and quotation within 30 minutes.`;

  return {
    success: true,
    quoteId,
    whatsappSent,
    voiceSummary,
  };
}

/**
 * Scans abandoned carts and sends recovery reminders
 */
export async function runCartRecoveryJob(minMinutes = 45, maxMinutes = 1440) {
  const abandoned = await getAbandonedCartSessions(minMinutes, maxMinutes);
  let remindersSent = 0;
  const details = [];

  for (const session of abandoned) {
    const res = await sendCartReminderWhatsApp(session.id);
    if (res.success) {
      remindersSent++;
      details.push({ id: session.id, phone: session.customerPhone, status: "SENT" });
    } else {
      details.push({ id: session.id, phone: session.customerPhone, status: "FAILED", error: res.error });
    }
  }

  return {
    scanned: abandoned.length,
    remindersSent,
    details,
  };
}

/**
 * Records customer celebration dates (birthday/anniversary) for repeat marketing
 */
export async function recordCelebrationDate(params: {
  customerPhone: string;
  customerName?: string;
  celebrationType: "birthday" | "anniversary" | "other";
  celebrationDate: string; // YYYY-MM-DD or DD-MM
  notes?: string;
}) {
  const { customerPhone, customerName, celebrationType, celebrationDate, notes } = params;

  try {
    await supabaseAdmin.from("customer_celebrations").insert({
      customer_phone: customerPhone,
      customer_name: customerName || null,
      celebration_type: celebrationType,
      celebration_date: celebrationDate,
      notes: notes || null,
      created_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn("Customer celebration insert note:", err.message);
  }

  return {
    success: true,
    voiceSummary: `Thank you, I've noted down your ${celebrationType} date on ${celebrationDate}. We look forward to baking for you!`,
  };
}
