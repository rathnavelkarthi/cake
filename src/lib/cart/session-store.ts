import { supabaseAdmin } from "@/lib/supabase/admin";
import { CartItem } from "@/lib/data/types";
import { sendWhatsAppMessage, formatWhatsAppNumber } from "@/lib/evolution/client";
import { BUSINESS_CONFIG } from "@/lib/config/business";

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
  // Fetch available products to map images & standard pricing if missing
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

  if (!input.items || input.items.length === 0) {
    throw new Error("At least one cake or bakery item is required in the session.");
  }

  const items = await normalizeSessionItems(input.items);
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= 1500 ? 0 : 60; // Default estimate
  const total = subtotal + deliveryFee;

  const sessionId = `cs_${Math.random().toString(36).substring(2, 10)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(); // 48-hour validity

  // Resolve public website base URL
  const baseUrl =
    origin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production" ? "https://kicheesbakeddelights.in" : "http://localhost:3000");

  const cartUrl = `${baseUrl.replace(/\/$/, "")}/shop?cart=${sessionId}`;

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
    cartUrl,
    expiresAt,
    createdAt: now.toISOString(),
  };

  // 1. Save in in-memory store
  memoryStore.set(sessionId, session);

  // 2. Persist in Supabase if table exists
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
      expires_at: session.expiresAt,
      created_at: session.createdAt,
    });
  } catch (err: any) {
    console.warn("Supabase cart_sessions insert warning (relying on memory fallback):", err.message);
  }

  // 3. Dispatch WhatsApp via Evolution API if requested
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

  // 1. Check in-memory store
  const cached = memoryStore.get(sessionId);
  if (cached) {
    return cached;
  }

  // 2. Query Supabase
  try {
    const { data, error } = await supabaseAdmin
      .from("cart_sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

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
      cartUrl: `https://kicheesbakeddelights.in/shop?cart=${data.id}`,
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
