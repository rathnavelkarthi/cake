import { NextRequest, NextResponse } from "next/server";
import { runCartRecoveryJob } from "@/lib/agent/tools";
import { sendCartReminderWhatsApp } from "@/lib/cart/session-store";

/**
 * POST /api/agent/cart-recovery
 * or GET /api/agent/cart-recovery
 * 
 * Scans abandoned cart sessions that haven't been completed within 45-1440 minutes
 * and dispatches gentle WhatsApp recovery reminders with 1-tap checkout links.
 * 
 * Can also target an individual session by passing { sessionId: "cs_xxx" }.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, minMinutes = 45, maxMinutes = 1440 } = body;

    if (sessionId) {
      const res = await sendCartReminderWhatsApp(sessionId);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: `WhatsApp reminder sent for session ${sessionId}` });
    }

    const jobResult = await runCartRecoveryJob(Number(minMinutes), Number(maxMinutes));
    return NextResponse.json({ success: true, ...jobResult });
  } catch (err: any) {
    console.error("Error in POST /api/agent/cart-recovery:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const minMinutes = Number(searchParams.get("minMinutes") || 45);
    const maxMinutes = Number(searchParams.get("maxMinutes") || 1440);

    const jobResult = await runCartRecoveryJob(minMinutes, maxMinutes);
    return NextResponse.json({ success: true, ...jobResult });
  } catch (err: any) {
    console.error("Error in GET /api/agent/cart-recovery:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
