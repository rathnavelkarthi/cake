import { NextRequest, NextResponse } from "next/server";
import { intakeCustomCakeLead } from "@/lib/agent/tools";

/**
 * POST /api/agent/quote-request
 * 
 * Captures custom/wedding cake inquiries from phone calls,
 * automatically texts the caller on WhatsApp asking for reference pictures,
 * and notifies the bakery owner via Hostinger SMTP.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerPhone,
      customerName,
      customerEmail,
      occasion,
      eventDate,
      guestCount,
      flavourPreference,
      budget,
      locality,
      notes,
      sendWhatsAppImagePrompt = true,
    } = body;

    if (!customerPhone) {
      return NextResponse.json(
        { error: "customerPhone is required (e.g. 9884631078 or +919884631078)" },
        { status: 400 }
      );
    }

    const result = await intakeCustomCakeLead({
      customerPhone,
      customerName,
      customerEmail,
      occasion,
      eventDate,
      guestCount,
      flavourPreference,
      budget,
      locality,
      notes,
      sendWhatsAppImagePrompt: Boolean(sendWhatsAppImagePrompt),
    });

    return NextResponse.json({ ...result });
  } catch (err: any) {
    console.error("Error in POST /api/agent/quote-request:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
