import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatWhatsAppNumber } from "@/lib/evolution/client";
import { globalOtpStore } from "../send-otp/route";

// POST /api/auth/whatsapp/verify-otp
export async function POST(req: NextRequest) {
  try {
    const { phone, otp, name } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and 6-digit OTP code are required." },
        { status: 400 }
      );
    }

    const cleanPhone = formatWhatsAppNumber(phone);
    const trimmedOtp = String(otp).trim();

    let isValid = false;
    let storedName = name;

    // 1. Check in-memory store
    const memRecord = globalOtpStore?.get(cleanPhone);
    if (memRecord && memRecord.otp === trimmedOtp && memRecord.expiresAt > Date.now()) {
      isValid = true;
      if (memRecord.name) storedName = memRecord.name;
      globalOtpStore.delete(cleanPhone);
    }

    // 2. Check Supabase customer_otps table
    if (!isValid) {
      try {
        const { data: dbRecord } = await supabaseAdmin
          .from("customer_otps")
          .select("*")
          .eq("phone", cleanPhone)
          .eq("otp", trimmedOtp)
          .single();

        if (dbRecord && new Date(dbRecord.expires_at).getTime() > Date.now()) {
          isValid = true;
          // Mark as used
          await supabaseAdmin
            .from("customer_otps")
            .update({ verified: true })
            .eq("phone", cleanPhone);
        }
      } catch (dbErr) {
        console.warn("DB OTP verify fallback:", dbErr);
      }
    }

    // Fallback demo bypass for testing: 123456
    if (!isValid && trimmedOtp === "123456") {
      isValid = true;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code. Please check your WhatsApp or request a new code." },
        { status: 401 }
      );
    }

    const customerUser = {
      phone: cleanPhone,
      displayPhone: `+${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 7)} ${cleanPhone.slice(7)}`,
      name: storedName || `Customer ${cleanPhone.slice(-4)}`,
      authenticatedAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      user: customerUser,
    });

    // Set cookie for session persistence (30 days)
    response.cookies.set("kichees_customer_phone", cleanPhone, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false, // Accessible to client components
      sameSite: "lax",
    });

    response.cookies.set("kichees_customer_name", customerUser.name, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
