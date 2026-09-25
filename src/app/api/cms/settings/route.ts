import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/cms/settings - Get settings from Supabase
export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get("key");

    if (key) {
      const { data, error } = await supabaseAdmin
        .from("cms_settings")
        .select("*")
        .eq("key", key)
        .single();

      if (error && error.code !== "PGRST116") {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ setting: data ? data.value : null });
    }

    const { data, error } = await supabaseAdmin
      .from("cms_settings")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const settingsMap: Record<string, any> = {};
    (data || []).forEach((row) => {
      settingsMap[row.key] = row.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/cms/settings - Upsert settings to Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "key and value are required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("cms_settings")
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, key });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
