import { NextRequest, NextResponse } from "next/server";
import { lookupOrderStatus } from "@/lib/agent/tools";

/**
 * GET /api/agent/order-status?phone=...&orderNumber=...&whatsapp=true
 * or POST /api/agent/order-status
 * 
 * Used by ElevenLabs voice agent to look up order status for inbound calls.
 * Returns order details and natural voiceSummary for the agent to speak.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone") || undefined;
    const orderNumber = searchParams.get("orderNumber") || undefined;
    const triggerWhatsApp = searchParams.get("whatsapp") === "true";

    const result = await lookupOrderStatus({ phone, orderNumber, triggerWhatsApp });
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Error in GET /api/agent/order-status:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, orderNumber, triggerWhatsApp = false } = body;

    const result = await lookupOrderStatus({ phone, orderNumber, triggerWhatsApp });
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Error in POST /api/agent/order-status:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
