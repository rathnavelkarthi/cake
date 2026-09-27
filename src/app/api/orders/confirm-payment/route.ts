import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPaymentConfirmedWhatsApp } from "@/lib/evolution/client";

// POST /api/orders/confirm-payment
// Admin / Manager confirms customer UPI payment and pushes order to Kitchen
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderNumber, assignedChef = "Selva (Head Chef)" } = body;

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: "Order ID or order number is required" },
        { status: 400 }
      );
    }

    // Update in Supabase
    let query = supabaseAdmin
      .from("orders")
      .update({
        payment_status: "PAID",
        order_status: "PREPARING",
        admin_notes: `Payment verified by manager. Assigned to: ${assignedChef}`,
        updated_at: new Date().toISOString(),
      });

    if (orderId) {
      query = query.eq("id", orderId);
    } else {
      query = query.eq("order_number", orderNumber);
    }

    const { data: updated, error } = await query.select().maybeSingle();

    if (error) {
      console.warn("Supabase update error:", error.message);
    }

    // Send WhatsApp payment confirmed update
    const targetMobile = updated?.customer_mobile || body.customerMobile;
    const customerName = updated?.customer_name || body.customerName || "Valued Customer";
    const ordNum = updated?.order_number || orderNumber;

    if (targetMobile) {
      try {
        await sendPaymentConfirmedWhatsApp({
          orderNumber: ordNum,
          customerName,
          customerMobile: targetMobile,
          assignedChef,
          fulfilmentType: updated?.fulfilment_type || "PICKUP",
        });
      } catch (waErr) {
        console.error("Evolution WhatsApp confirm error:", waErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Order ${ordNum} payment verified and pushed to kitchen station.`,
      order: updated,
    });
  } catch (err: any) {
    console.error("confirm-payment error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
