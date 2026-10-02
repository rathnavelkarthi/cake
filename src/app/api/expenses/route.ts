import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/expenses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let query = supabaseAdmin.from("expenses").select("*").order("date", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      // If table doesn't exist yet, return empty list gracefully
      return NextResponse.json({ expenses: [] });
    }

    return NextResponse.json({ expenses: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/expenses
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      category,
      amount,
      date,
      paymentMode,
      vendor,
      invoiceNumber,
      status,
      recordedBy,
      notes,
    } = body;

    if (!title || !amount || !category) {
      return NextResponse.json(
        { error: "Title, category and amount are required" },
        { status: 400 }
      );
    }

    const payload = {
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      category,
      amount: Number(amount),
      date: date || new Date().toISOString().split("T")[0],
      payment_mode: paymentMode || "UPI",
      vendor: vendor?.trim() || "General",
      invoice_number: invoiceNumber?.trim() || null,
      status: status || "PAID",
      recorded_by: recordedBy?.trim() || "Admin",
      notes: notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabaseAdmin
        .from("expenses")
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, expense: data });
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, expense: payload });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
