import { NextRequest, NextResponse } from "next/server";
import { createCartSession, getCartSession } from "@/lib/cart/session-store";

/**
 * POST /api/cart/session
 * Generates a pre-filled cart session link for the AI agent or staff
 * and automatically dispatches it via WhatsApp to the customer.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerPhone,
      customerName,
      items,
      customerNotes,
      sendWhatsApp = true,
      addons,
      addCandles,
      addCard,
      addBrownies,
    } = body;

    if (!customerPhone) {
      return NextResponse.json(
        { error: "customerPhone is required (e.g., +919876543210 or 9876543210)" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items array with at least one item is required" },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || req.nextUrl.origin;

    const session = await createCartSession({
      customerPhone,
      customerName,
      items,
      addons,
      addCandles,
      addCard,
      addBrownies,
      customerNotes,
      sendWhatsApp: Boolean(sendWhatsApp),
      origin,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      cartUrl: session.cartUrl,
      subtotal: session.subtotal,
      deliveryFee: session.deliveryFee,
      total: session.total,
      itemsCount: session.items.length,
      whatsappSent: session.whatsappSent,
      expiresAt: session.expiresAt,
      session,
    });
  } catch (err: any) {
    console.error("Error creating cart session:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create cart session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cart/session?id=cs_xxx
 * Retrieves details for a pre-filled cart session to hydrate the customer's cart
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || searchParams.get("sessionId");

    if (!id) {
      return NextResponse.json(
        { error: "Session ID parameter (?id=cs_xxx) is required" },
        { status: 400 }
      );
    }

    const session = await getCartSession(id);

    if (!session) {
      return NextResponse.json(
        { error: "Cart session not found or has expired" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (err: any) {
    console.error("Error retrieving cart session:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch cart session" },
      { status: 500 }
    );
  }
}
