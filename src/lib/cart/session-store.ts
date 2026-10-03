import { supabaseAdmin } from "@/lib/supabase/admin";
import { CartItem } from "@/lib/data/types";
import { sendWhatsAppMessage, formatWhatsAppNumber } from "@/lib/evolution/client";
import { BUSINESS_CONFIG } from "@/lib/config/business";

export const CELEBRATION_ADDONS_DEF: Record<string, {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  price: number;
  image: string;
  isEggless: boolean;
}> = {
  candles: {
    productId: "addon-candles",
    variantId: "set-1",
    name: "Artisanal Gold Candles & Wooden Server Set",
    variantLabel: "Set of 6 + Knife",
    price: 99,
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&auto=format&fit=crop&q=80",
    isEggless: true,
  },
  card: {
    productId: "addon-card",
    variantId: "card-1",
    name: "Handwritten Letterpress Birthday Card",
    variantLabel: "Custom Card",
    price: 120,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&auto=format&fit=crop&q=80",
    isEggless: true,
  },
  brownies: {
    productId: "addon-brownie-taster",
    variantId: "taster-2",
    name: "Taster Pair: Molten Dark Fudge Brownies",
    variantLabel: "Box of 2",
    price: 190,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&auto=format&fit=crop&q=80",
    isEggless: true,
  },
};

export interface CartSessionData {
  id: string;
  customerName?: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerNotes?: string;
  whatsappSent: boolean;
  reminderSent?: boolean;
  isCompleted?: boolean;
  convertedOrderId?: string;
  cartUrl: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreateSessionInput {
  customerPhone: string;
  customerName?: string;
  items: Array<{
    productId?: string;
    variantId?: string;
    name: string;
    variantLabel?: string;
    price?: number;
    quantity?: number;
    image?: string;
    isEggless?: boolean;
    customMessage?: string;
  }>;
  addons?: Array<"candles" | "card" | "brownies" | string>;
  addCandles?: boolean;
  addCard?: boolean;
  addBrownies?: boolean;
  customerNotes?: string;
  sendWhatsApp?: boolean;
  origin?: string;
}

// In-memory fallback cache so sessions persist in-process even before database migration is applied
declare global {
  var __cartSessionsMemory: Map<string, CartSessionData> | undefined;
}

const memoryStore: Map<string, CartSessionData> =
  global.__cartSessionsMemory || (global.__cartSessionsMemory = new Map());

/**
 * Normalizes and enriches items with catalog details (images, pricing, variants)
 */
export async function normalizeSessionItems(rawItems: CreateSessionInput["items"]): Promise<CartItem[]> {
  let catalogMap = new Map<string, any>();
  try {
    const { data: dbProducts } = await supabaseAdmin.from("products").select("*").eq("is_active", true);
    if (dbProducts) {
      for (const p of dbProducts) {
        catalogMap.set(p.name.toLowerCase().trim(), p);
        if (p.id) catalogMap.set(p.id.toLowerCase(), p);
      }
    }
  } catch (e) {
    console.warn("Unable to fetch catalog map for cart session, using provided inputs:", e);
  }

  return rawItems.map((raw, index) => {
    const searchKey = (raw.name || "").toLowerCase().trim();
    const matched = catalogMap.get(searchKey) || (raw.productId ? catalogMap.get(raw.productId.toLowerCase()) : null);

    const qty = Math.max(1, Number(raw.quantity) || 1);
    const price = raw.price !== undefined ? Number(raw.price) : matched?.price ? Number(matched.price) : 650;
    const isEggless = raw.isEggless !== undefined ? Boolean(raw.isEggless) : matched?.is_eggless !== false;
    const image = raw.image || matched?.image_url || "/images/hero-truffle.jpg";
    const variantLabel = raw.variantLabel || (matched?.variants?.[0]?.label ?? "Standard (0.5 kg)");
    const productId = raw.productId || matched?.id || `prod-${Date.now()}-${index}`;
    const variantId = raw.variantId || matched?.variants?.[0]?.id || `var-${Date.now()}-${index}`;

    return {
      cartItemId: `session-${productId}-${variantId}-${Date.now()}-${index}`,
      productId,
      variantId,
      name: raw.name || matched?.name || "Artisanal Cake",
      variantLabel,
      price,
      quantity: qty,
      image,
      isEggless,
      customMessage: raw.customMessage,
    };
  });
}

/**
 * Creates a pre-filled cart session, generates a shareable link,
 * and optionally sends it directly to the customer on WhatsApp.
 */
export async function createCartSession(input: CreateSessionInput): Promise<CartSessionData> {
  const { customerPhone, customerName, customerNotes, sendWhatsApp = true, origin } = input;

  if (!customerPhone) {
    throw new Error("Customer phone number is required to create a cart session.");
  }

  const combinedRawItems = [...(input.items || [])];

  // Resolve upsell celebration addons
  const requestedAddons = new Set<string>(input.addons || []);
  if (input.addCandles) requestedAddons.add("candles");
  if (input.addCard) requestedAddons.add("card");
  if (input.addBrownies) requestedAddons.add("brownies");

  for (const addonKey of requestedAddons) {
    const def = CELEBRATION_ADDONS_DEF[addonKey.toLowerCase()];
    if (def) {
      combinedRawItems.push({
        productId: def.productId,
        variantId: def.variantId,
        name: def.name,
        variantLabel: def.variantLabel,
        price: def.price,
        quantity: 1,
        image: def.image,
        isEggless: def.isEggless,
      });
    }
  }

  if (combinedRawItems.length === 0) {
    throw new Error("At least one cake or bakery item is required in the session.");
  }

  const items = await normalizeSessionItems(combinedRawItems);
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= 1500 ? 0 : 60; // Free delivery above 1500
  const total = subtotal + deliveryFee;

  const sessionId = `cs_${Math.random().toString(36).substring(2, 10)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

  // Prefer explicit env var over request origin — agent/internal calls
  // often arrive with the server's bind address (0.0.0.0, 127.0.0.1).
  const safeOrigin =
    origin && !/0\.0\.0\.0|127\.0\.0\.1|localhost/.test(origin)
      ? origin
      : undefined;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    safeOrigin ||
    (process.env.NODE_ENV === "production" ? "https://kicheesbakeddelights.in" : "http://localhost:3000");

  const cartUrl = `${baseUrl.replace(/\/$/, "")}/checkout?cart=${sessionId}`;

  const session: CartSessionData = {
    id: sessionId,
    customerName: customerName?.trim() || "",
    customerPhone: customerPhone.trim(),
    items,
    subtotal,
    deliveryFee,
    total,
    customerNotes: customerNotes?.trim(),
    whatsappSent: false,
    reminderSent: false,
    isCompleted: false,
    cartUrl,
    expiresAt,
    createdAt: now.toISOString(),
  };

  memoryStore.set(sessionId, session);

  try {
    await supabaseAdmin.from("cart_sessions").insert({
      id: sessionId,
      customer_name: session.customerName,
      customer_phone: session.customerPhone,
      items: session.items,
      subtotal: session.subtotal,
      delivery_fee: session.deliveryFee,
      total: session.total,
      customer_notes: session.customerNotes,
      whatsapp_sent: false,
      reminder_sent: false,
      is_completed: false,
      expires_at: session.expiresAt,
      created_at: session.createdAt,
    });
  } catch (err: any) {
    console.warn("Supabase cart_sessions insert warning (relying on memory fallback):", err.message);
  }

  if (sendWhatsApp) {
    try {
      const itemsListText = items
        .map((i) => `• ${i.quantity}x ${i.name} (${i.variantLabel}) - ₹${(i.price * i.quantity).toLocaleString("en-IN")}`)
        .join("\n");

      const greetingName = session.customerName ? `Hi ${session.customerName}!` : "Hello!";

      const message = `${greetingName} 🎂

We've prepared your order basket at *Kichee's Baked Delights*:

${itemsListText}

💰 *Subtotal:* ₹${subtotal.toLocaleString("en-IN")}

👉 *Tap here to review your items, enter delivery address & complete checkout:*
${cartUrl}

Freshly baked with pure butter & Belgian Callebaut chocolate. If you need any customization, just reply here!

— Kichee's Baking Desk, Nungambakkam
📞 ${BUSINESS_CONFIG.phoneDisplay}`;

      const waResult = await sendWhatsAppMessage(customerPhone, message);
      session.whatsappSent = Boolean(waResult.success);

      if (session.whatsappSent) {
        memoryStore.set(sessionId, session);
        try {
          await supabaseAdmin
            .from("cart_sessions")
            .update({ whatsapp_sent: true })
            .eq("id", sessionId);
        } catch {}
      }
    } catch (waError) {
      console.error("Failed to dispatch WhatsApp cart link:", waError);
    }
  }

  return session;
}

/**
 * Retrieves a cart session by session ID
 */
export async function getCartSession(sessionId: string): Promise<CartSessionData | null> {
  if (!sessionId) return null;

  const cached = memoryStore.get(sessionId);
  if (cached) return cached;

  try {
    const { data, error } = await supabaseAdmin
      .from("cart_sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle();

    if (error || !data) return null;

    const session: CartSessionData = {
      id: data.id,
      customerName: data.customer_name || "",
      customerPhone: data.customer_phone,
      items: data.items || [],
      subtotal: Number(data.subtotal || 0),
      deliveryFee: Number(data.delivery_fee || 0),
      total: Number(data.total || 0),
      customerNotes: data.customer_notes || "",
      whatsappSent: Boolean(data.whatsapp_sent),
      reminderSent: Boolean(data.reminder_sent),
      isCompleted: Boolean(data.is_completed),
      convertedOrderId: data.converted_order_id,
      cartUrl: `https://kicheesbakeddelights.in/checkout?cart=${data.id}`,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    };

    memoryStore.set(sessionId, session);
    return session;
  } catch (err) {
    console.error("Error retrieving cart session:", err);
    return null;
  }
}

/**
 * Finds abandoned cart sessions created between minMinutes and maxMinutes ago
 * that haven't been completed and haven't had a reminder sent yet.
 */
export async function getAbandonedCartSessions(minMinutes = 45, maxMinutes = 1440): Promise<CartSessionData[]> {
  const cutoffStart = new Date(Date.now() - maxMinutes * 60 * 1000).toISOString();
  const cutoffEnd = new Date(Date.now() - minMinutes * 60 * 1000).toISOString();

  try {
    const { data, error } = await supabaseAdmin
      .from("cart_sessions")
      .select("*")
      .eq("reminder_sent", false)
      .eq("is_completed", false)
      .gte("created_at", cutoffStart)
      .lte("created_at", cutoffEnd)
      .order("created_at", { ascending: false });

    if (error || !data) {
      // Memory store fallback
      const results: CartSessionData[] = [];
      const minMs = minMinutes * 60 * 1000;
      const maxMs = maxMinutes * 60 * 1000;
      const now = Date.now();

      for (const s of memoryStore.values()) {
        const age = now - new Date(s.createdAt).getTime();
        if (age >= minMs && age <= maxMs && !s.reminderSent && !s.isCompleted) {
          results.push(s);
        }
      }
      return results;
    }

    return data.map((d: any) => ({
      id: d.id,
      customerName: d.customer_name || "",
      customerPhone: d.customer_phone,
      items: d.items || [],
      subtotal: Number(d.subtotal || 0),
      deliveryFee: Number(d.delivery_fee || 0),
      total: Number(d.total || 0),
      customerNotes: d.customer_notes || "",
      whatsappSent: Boolean(d.whatsapp_sent),
      reminderSent: Boolean(d.reminder_sent),
      isCompleted: Boolean(d.is_completed),
      convertedOrderId: d.converted_order_id,
      cartUrl: `https://kicheesbakeddelights.in/shop?cart=${d.id}`,
      expiresAt: d.expires_at,
      createdAt: d.created_at,
    }));
  } catch (e) {
    console.error("Error fetching abandoned sessions:", e);
    return [];
  }
}

/**
 * Sends a friendly cart recovery follow-up via WhatsApp
 */
export async function sendCartReminderWhatsApp(sessionId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getCartSession(sessionId);
  if (!session) return { success: false, error: "Session not found" };

  const firstItem = session.items[0]?.name || "freshly baked artisanal cake";
  const greeting = session.customerName ? `Hi ${session.customerName}!` : "Hello!";

  const reminderMessage = `${greeting} 🎂

Chef Selva is organizing today's afternoon baking schedule at our Nungambakkam kitchen.

Your basket for *${firstItem}* is still saved. Would you like us to slot your cake into today's bake?

👉 *Tap here to complete your order:*
${session.cartUrl}

If you need any adjustments or custom piping on the cake, just reply directly to this message!

— Kichee's Baking Desk, Nungambakkam
📞 ${BUSINESS_CONFIG.phoneDisplay}`;

  const res = await sendWhatsAppMessage(session.customerPhone, reminderMessage);

  if (res.success) {
    session.reminderSent = true;
    memoryStore.set(session.id, session);
    try {
      await supabaseAdmin
        .from("cart_sessions")
        .update({ reminder_sent: true })
        .eq("id", session.id);
    } catch {}
    return { success: true };
  } else {
    return { success: false, error: res.error || "Failed to send WhatsApp reminder" };
  }
}
