import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  sendOrderConfirmationWhatsApp,
  sendKitchenStatusUpdateWhatsApp,
  generateUpiDetails,
  formatWhatsAppNumber,
} from "@/lib/evolution/client";
import { CHENNAI_BRANCHES } from "@/lib/config/branches";

// GET /api/orders
// Fetch orders: by customer mobile or all for admin
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const phone = searchParams.get("phone");
    const orderNumber = searchParams.get("orderNumber");

    let query = supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "");
      const formatted = cleanPhone.slice(-10); // last 10 digits
      query = query.ilike("customer_mobile", `%${formatted}%`);
    }

    if (orderNumber) {
      query = query.eq("order_number", orderNumber);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Supabase query error in GET /api/orders:", error.message);
      return NextResponse.json({ orders: [] });
    }

    const enriched = (data || []).map((row: any) => {
      let effectiveStatus = row.order_status;
      if (row.order_status === "PREPARING" && row.admin_notes) {
        const stageMatch = row.admin_notes.match(/\[STAGE:([A-Z_]+)\]/);
        if (stageMatch && stageMatch[1]) {
          effectiveStatus = stageMatch[1];
        }
      }
      return {
        ...row,
        order_status: effectiveStatus,
      };
    });

    return NextResponse.json({ orders: enriched });
  } catch (err: any) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/orders
// Create new customer order, save in DB & send WhatsApp with UPI QR code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerMobile,
      customerEmail,
      items,
      subtotal,
      fulfilmentType = "PICKUP",
      branchId = CHENNAI_BRANCHES[0]?.id ?? "nungambakkam",
      deliveryAddress,
      deliveryDistanceKm = 0,
      deliveryFee = 0,
      total,
      customerNotes,
      requestedDate,
      requestedTime,
    } = body;

    if (!customerName || !customerMobile || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer name, valid mobile number, and at least one item are required." },
        { status: 400 }
      );
    }

    // Find branch info
    const branch =
      CHENNAI_BRANCHES.find((b) => b.id === branchId) || CHENNAI_BRANCHES[0];
    const branchName = branch.name;
    const branchAddress = branch.address;

    const timestamp = Date.now().toString().slice(-4);
    const orderNumber = `KCH-${new Date().getFullYear()}-${timestamp}`;
    const orderId = `ord-${Date.now()}`;

    const calculatedTotal = Number(total || (Number(subtotal || 0) + Number(deliveryFee || 0)));

    // Prepare items list for WhatsApp formatting
    const formattedItemStrings = items.map((i: any) => {
      if (typeof i === "string") return i;
      const qty = i.quantity || 1;
      const name = i.name || "Artisanal Cake";
      const variant = i.variantLabel ? ` (${i.variantLabel})` : "";
      const price = i.price ? ` - ₹${(i.price * qty).toLocaleString("en-IN")}` : "";
      return `${qty}x ${name}${variant}${price}`;
    });

    // Save to Supabase orders table
    const orderPayload: Record<string, any> = {
      id: orderId,
      order_number: orderNumber,
      customer_name: customerName.trim(),
      customer_mobile: customerMobile.trim(),
      customer_email: customerEmail?.trim() || null,
      subtotal: Number(subtotal || calculatedTotal),
      delivery_fee: Number(deliveryFee || 0),
      total: calculatedTotal,
      payment_status: "PENDING",
      payment_method: "UPI",
      order_status: "PENDING_PAYMENT",
      fulfilment_type: fulfilmentType === "DELIVERY" ? "DELIVERY" : "PICKUP",
      delivery_address: deliveryAddress || null,
      requested_date: requestedDate || null,
      requested_time: requestedTime || null,
      customer_notes: customerNotes || null,
      items: items,
      admin_notes: `Branch: ${branch.shortName} | Distance: ${deliveryDistanceKm} km`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Attempt to insert with optional branch columns
    try {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .insert({
          ...orderPayload,
          branch_id: branch.id,
          branch_name: branch.name,
          delivery_distance_km: Number(deliveryDistanceKm || 0),
        })
        .select()
        .single();

      if (error) {
        // If columns don't exist yet, retry without new columns
        console.warn("Retrying insert without extra branch columns:", error.message);
        await supabaseAdmin.from("orders").insert(orderPayload);
      }
    } catch (insertErr) {
      console.error("Database insert error:", insertErr);
    }

    // Generate UPI details
    const upiDetails = generateUpiDetails(orderNumber, calculatedTotal);

    // Trigger WhatsApp notification via Evolution API in background (non-blocking)
    let whatsappSent = false;
    try {
      const waResult = await sendOrderConfirmationWhatsApp({
        orderNumber,
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        total: calculatedTotal,
        fulfilmentType: fulfilmentType === "DELIVERY" ? "DELIVERY" : "PICKUP",
        branchName: branch.shortName,
        branchAddress: branch.address,
        deliveryAddress,
        deliveryDistanceKm,
        deliveryFee: Number(deliveryFee || 0),
        items: formattedItemStrings,
      });
      whatsappSent = Boolean(waResult?.textResult?.success || waResult?.mediaResult?.success);
    } catch (waErr) {
      console.error("Evolution WhatsApp send failed:", waErr);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        orderNumber,
        customerName,
        customerMobile,
        total: calculatedTotal,
        subtotal,
        deliveryFee,
        fulfilmentType,
        branch,
        deliveryAddress,
        deliveryDistanceKm,
        orderStatus: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        whatsappSent,
        createdAt: new Date().toISOString(),
      },
      upi: upiDetails,
    });
  } catch (err: any) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/orders
// Update order status, payment status, chef assignment, or notes
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      orderNumber,
      orderStatus,
      paymentStatus,
      assignedChef,
      adminNotes,
    } = body;

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: "orderId or orderNumber is required." },
        { status: 400 }
      );
    }

    // Fetch existing order to merge notes and detect duplicates
    let fetchQuery = supabaseAdmin
      .from("orders")
      .select("id, order_number, admin_notes, order_status, payment_status, customer_mobile, customer_name, fulfilment_type, branch_name, delivery_address");
    if (orderId) {
      fetchQuery = fetchQuery.eq("id", orderId);
    } else {
      fetchQuery = fetchQuery.eq("order_number", orderNumber);
    }
    const { data: existing, error: fetchErr } = await fetchQuery.maybeSingle();

    if (fetchErr) {
      console.warn("Could not find order to patch in Supabase:", fetchErr.message);
    }

    // Determine DB-compatible order_status and stage tag
    const isKitchenSubStage =
      orderStatus === "IN_OVEN" ||
      orderStatus === "COOLING" ||
      orderStatus === "DECORATING";

    let dbOrderStatus = orderStatus;
    if (isKitchenSubStage) {
      dbOrderStatus = "PREPARING";
    }

    // Check if the order was already transitioned to this stage (prevents double WhatsApp messages)
    const existingNotes = existing?.admin_notes || "";
    const isAlreadyAtStage = Boolean(
      (isKitchenSubStage && existingNotes.includes(`[STAGE:${orderStatus}]`)) ||
      (!isKitchenSubStage && existing?.order_status === dbOrderStatus && existingNotes.includes(`[WA:${orderStatus}]`))
    );

    let mergedNotes = (existing?.admin_notes || adminNotes || "").trim();
    // Clean any prior stage tag
    mergedNotes = mergedNotes.replace(/\[STAGE:[A-Z_]+\]\s*/g, "").trim();

    if (isKitchenSubStage) {
      mergedNotes = `[STAGE:${orderStatus}] ${mergedNotes}`.trim();
    }
    if (orderStatus && !mergedNotes.includes(`[WA:${orderStatus}]`)) {
      mergedNotes = `${mergedNotes} [WA:${orderStatus}]`.trim();
    }

    if (assignedChef) {
      if (!mergedNotes.includes(`Assigned to: ${assignedChef}`)) {
        mergedNotes = `${mergedNotes} | Assigned to: ${assignedChef}`.trim();
      }
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (dbOrderStatus) {
      updatePayload.order_status = dbOrderStatus;
    }
    if (paymentStatus) {
      updatePayload.payment_status = paymentStatus;
    }
    if (mergedNotes) {
      updatePayload.admin_notes = mergedNotes;
    }

    let updateQuery = supabaseAdmin.from("orders").update(updatePayload);
    if (orderId) {
      updateQuery = updateQuery.eq("id", orderId);
    } else {
      updateQuery = updateQuery.eq("order_number", orderNumber);
    }

    const { data: updated, error: updateErr } = await updateQuery.select().maybeSingle();

    if (updateErr) {
      console.error("PATCH /api/orders update error:", updateErr.message);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    const returnedStatus = orderStatus || (isKitchenSubStage ? orderStatus : updated?.order_status);

    // Send customer WhatsApp status update asynchronously ONLY if stage changed (prevents double sends)
    if (orderStatus && !isAlreadyAtStage && updated?.customer_mobile) {
      sendKitchenStatusUpdateWhatsApp({
        orderNumber: updated.order_number || orderNumber,
        customerName: updated.customer_name || "Valued Customer",
        customerMobile: updated.customer_mobile,
        stage: orderStatus,
        assignedChef,
        fulfilmentType: updated.fulfilment_type,
        branchName: updated.branch_name,
        deliveryAddress: updated.delivery_address,
      }).catch((waErr) => {
        console.warn("Kitchen WhatsApp update error:", waErr);
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        ...(updated || {}),
        order_status: returnedStatus,
      },
    });
  } catch (err: any) {
    console.error("PATCH /api/orders exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
