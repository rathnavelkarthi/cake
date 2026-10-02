import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("suppliers")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ suppliers: [] });
    }

    return NextResponse.json({ suppliers: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = {
      id: `sup-${Date.now()}`,
      name: body.name,
      contact_person: body.contactPerson || null,
      email: body.email,
      phone: body.phone,
      gstin: body.gstin || null,
      address: body.address,
      category: body.category || "General",
      payment_terms: body.paymentTerms || "Net 30 Days",
      created_at: new Date().toISOString(),
    };

    try {
      await supabaseAdmin.from("suppliers").insert(payload);
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ success: true, supplier: payload });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
