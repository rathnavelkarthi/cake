import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendCustomerOtpWhatsApp, formatWhatsAppNumber } from "@/lib/evolution/client";

// In-memory fallback cache for OTPs (persists during server runtime)
const globalOtpStore = new Map<string, { otp: string; expiresAt: number; name?: string }>();

// POST /api/auth/whatsapp/send-otp
export async function POST(req: NextRequest) {
  try {
    const { phone, name } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    const cleanPhone = formatWhatsAppNumber(phone);
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Generate 6-digit secure numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in memory cache
    globalOtpStore.set(cleanPhone, { otp, expiresAt, name });

    // Store in Supabase if table exists
    try {
      await supabaseAdmin.from("customer_otps").upsert({
        phone: cleanPhone,
        otp,
        expires_at: new Date(expiresAt).toISOString(),
        verified: false,
      });
    } catch (dbErr) {
      console.warn("Supabase customer_otps table not ready, used memory cache:", dbErr);
    }

    // Send OTP via Evolution WhatsApp API
    const waResult = await sendCustomerOtpWhatsApp(cleanPhone, otp);

    return NextResponse.json({
      success: true,
      message: `OTP sent to your WhatsApp (${cleanPhone.slice(-10)}).`,
      whatsappSent: waResult.success,
      // For developer/demo convenience in development:
      debugOtp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (err: any) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export { globalOtpStore };
