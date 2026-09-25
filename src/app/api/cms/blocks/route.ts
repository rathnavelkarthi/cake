import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ContentBlock } from "@/lib/cms/types";

// GET /api/cms/blocks - Retrieve all visible CMS blocks for storefront / admin
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("cms_blocks")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching CMS blocks from Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map database rows back to ContentBlock interface
    const blocks: ContentBlock[] = (data || []).map((row) => ({
      id: row.id,
      type: row.block_type as any,
      isVisible: row.is_visible,
      title: row.title || "",
      subtitle: row.subtitle || "",
      badge: row.badge || "",
      content: row.content || "",
      primaryCtaText: row.primary_cta_text || "",
      primaryCtaLink: row.primary_cta_link || "",
      secondaryCtaText: row.secondary_cta_text || "",
      secondaryCtaLink: row.secondary_cta_link || "",
      imageUrl: row.image_url || "",
      ...(row.metadata || {}),
    }));

    return NextResponse.json({ blocks });
  } catch (err: any) {
    console.error("API error in GET /api/cms/blocks:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/cms/blocks - Save/update all CMS blocks from Admin CMS editor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const blocks: ContentBlock[] = body.blocks;

    if (!Array.isArray(blocks)) {
      return NextResponse.json({ error: "Invalid blocks array" }, { status: 400 });
    }

    const rows = blocks.map((b, index) => {
      const {
        id,
        type,
        isVisible,
        ...rest
      } = b as any;

      return {
        id,
        block_type: type,
        title: rest.title || null,
        subtitle: rest.subtitle || null,
        badge: rest.badge || null,
        content: rest.content || null,
        primary_cta_text: rest.primaryCtaText || null,
        primary_cta_link: rest.primaryCtaLink || null,
        secondary_cta_text: rest.secondaryCtaText || null,
        secondary_cta_link: rest.secondaryCtaLink || null,
        image_url: rest.imageUrl || null,
        metadata: rest,
        is_visible: isVisible !== false,
        sort_order: index + 1,
        updated_at: new Date().toISOString(),
      };
    });

    const { data, error } = await supabaseAdmin
      .from("cms_blocks")
      .upsert(rows);

    if (error) {
      console.error("Error updating CMS blocks in Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: rows.length });
  } catch (err: any) {
    console.error("API error in POST /api/cms/blocks:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
