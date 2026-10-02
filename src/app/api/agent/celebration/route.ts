import { NextRequest, NextResponse } from "next/server";
import { recordCelebrationDate } from "@/lib/agent/tools";

/**
 * POST /api/agent/celebration
 * 
 * Captures customer birthdays or wedding anniversaries during calls
 * so the bakery can send annual re-order reminders.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerPhone, customerName, celebrationType = "birthday", celebrationDate, notes } = body;

    if (!customerPhone || !celebrationDate) {
      return NextResponse.json(
        { error: "customerPhone and celebrationDate (YYYY-MM-DD or DD-MM) are required" },
        { status: 400 }
      );
    }

    const result = await recordCelebrationDate({
      customerPhone,
      customerName,
      celebrationType,
      celebrationDate,
      notes,
    });

    return NextResponse.json({ ...result });
  } catch (err: any) {
    console.error("Error in POST /api/agent/celebration:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
