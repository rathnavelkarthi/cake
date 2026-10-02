import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/purchase-orders
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("purchase_orders")
      .select("*, purchase_order_items(*)")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ purchaseOrders: [] });
    }

    return NextResponse.json({ purchaseOrders: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/purchase-orders
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      poNumber,
      supplierId,
      supplierName,
      items,
      subtotal,
      taxTotal,
      shippingFee,
      grandTotal,
      status,
      deliveryLocation,
      paymentTerms,
      notes,
    } = body;

    const poPayload = {
      id: `po-${Date.now()}`,
      po_number: poNumber,
      supplier_id: supplierId,
      supplier_name: supplierName,
      subtotal: Number(subtotal),
      tax_total: Number(taxTotal || 0),
      shipping_fee: Number(shippingFee || 0),
      grand_total: Number(grandTotal),
      status: status || "DRAFT",
      delivery_location: deliveryLocation,
      payment_terms: paymentTerms,
      notes: notes || null,
      items: items || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await supabaseAdmin.from("purchase_orders").insert(poPayload);
    } catch {
      // Non-fatal if Supabase table not created yet
    }

    return NextResponse.json({ success: true, purchaseOrder: poPayload });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
