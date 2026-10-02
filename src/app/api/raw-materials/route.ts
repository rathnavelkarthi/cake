import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SELECT_COLUMNS =
  "id, name, sku, category, stock, unit, min_threshold, cost_per_unit, supplier, is_active, updated_at";

/** Row shape as returned by Supabase; nullable where the column is nullable. */
interface RawMaterialRow {
  id: number | string;
  name: string;
  sku: string | null;
  category: string;
  stock: number | string | null;
  unit: string;
  min_threshold: number | string | null;
  cost_per_unit: number | string | null;
  supplier?: string | null;
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Normalises a thrown value into a message without asserting it is an Error. */
function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unexpected server error";
}

/** GET /api/raw-materials - hydrates the admin store so raw materials survive a reload. */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("raw_materials")
      .select(SELECT_COLUMNS)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching raw materials:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const materials = ((data ?? []) as RawMaterialRow[]).map((row) => ({
      id: Number(row.id),
      name: row.name,
      sku: row.sku,
      category: row.category,
      stock: toNumber(row.stock),
      unit: row.unit,
      minThreshold: toNumber(row.min_threshold, 5),
      costPerUnit: toNumber(row.cost_per_unit),
      supplier: row.supplier ?? undefined,
    }));

    return NextResponse.json({ rawMaterials: materials });
  } catch (err) {
    console.error("API error in GET /api/raw-materials:", err);
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}

/** POST /api/raw-materials - register one new raw material. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Material name is required" }, { status: 400 });
    }

    const row = {
      name: body.name.trim(),
      sku: body.sku?.trim() || null,
      category: body.category?.trim() || "General",
      stock: toNumber(body.stock),
      unit: body.unit || "kg",
      min_threshold: toNumber(body.minThreshold ?? body.min_threshold, 5),
      cost_per_unit: toNumber(body.costPerUnit ?? body.cost_per_unit),
      supplier: body.supplier?.trim() || null,
      is_active: body.isActive !== false,
    };

    const { data, error } = await supabaseAdmin
      .from("raw_materials")
      .insert(row)
      .select(SELECT_COLUMNS)
      .single();

    if (error) {
      console.error("Error creating raw material:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rawMaterial: data });
  } catch (err) {
    console.error("API error in POST /api/raw-materials:", err);
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}

/** PUT /api/raw-materials - adjust stock, cost or details. */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body?.id;

    if (id === undefined || id === null) {
      return NextResponse.json({ error: "Raw material id is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.sku !== undefined) updates.sku = body.sku?.trim() || null;
    if (body.category !== undefined) updates.category = body.category;
    if (body.stock !== undefined) updates.stock = toNumber(body.stock);
    if (body.minThreshold !== undefined) updates.min_threshold = toNumber(body.minThreshold, 5);
    if (body.costPerUnit !== undefined) updates.cost_per_unit = toNumber(body.costPerUnit);
    if (body.supplier !== undefined) updates.supplier = body.supplier?.trim() || null;
    if (body.isActive !== undefined) updates.is_active = Boolean(body.isActive);

    const { data, error } = await supabaseAdmin
      .from("raw_materials")
      .update(updates)
      .eq("id", id)
      .select(SELECT_COLUMNS)
      .single();

    if (error) {
      console.error("Error updating raw material:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rawMaterial: data });
  } catch (err) {
    console.error("API error in PUT /api/raw-materials:", err);
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}
