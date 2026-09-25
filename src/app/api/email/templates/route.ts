import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/email/templates - Fetch all email templates
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .select("*")
      .order("template_key", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ templates: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/email/templates - Update template subject, body_html, is_active
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, template_key, subject, body_html, body_text, is_active } = body;

    const queryKey = id ? { id } : { template_key };

    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .update({
        subject,
        body_html,
        body_text,
        is_active: is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .match(queryKey)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, template: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
