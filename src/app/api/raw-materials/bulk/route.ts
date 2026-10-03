import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/raw-materials/bulk
 *
 * Upserts a whole sheet of raw materials in one round trip.
 * A row matches an existing material by SKU first, then by name, so
 * re-uploading a corrected file updates rather than duplicates.
 *
 * Body: { items: [{ name, sku?, category?, stock?, unit?, minThreshold?, costPerUnit?, supplier? }] }
 */
interface IncomingMaterial {
  name: string;
  sku?: string;
  category?: string;
  stock?: number;
  unit?: string;
  minThreshold?: number;
  costPerUnit?: number;
  supplier?: string;
}

interface RowResult {
  index: number;
  name: string;
  action: "created" | "updated" | "skipped";
  id?: number;
  error?: string;
  /** Informational, e.g. a duplicate row that was superseded. */
  note?: string;
}

/** Row shape as returned by Supabase; nullable where the column is nullable. */
interface RawMaterialDbRow {
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

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function makeSku(name: string, used: Set<string>, existingSkus: Set<string>): string {
  const base = (
    name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .split("-")
      .slice(0, 3)
      .join("-") || "RAW"
  ).slice(0, 24);

  let candidate = `RAW-${base}`;
  let counter = 2;
  // Existing SKUs are off limits, and so are ones we already handed out this run.
  while (used.has(candidate) || existingSkus.has(candidate)) {
    candidate = `RAW-${base}-${counter}`;
    counter += 1;
  }
  used.add(candidate);
  return candidate;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: IncomingMaterial[] = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ error: "No items supplied" }, { status: 400 });
    }
    if (items.length > 2000) {
      return NextResponse.json(
        { error: "Too many rows in one upload. Split the file into batches of 2000." },
        { status: 400 }
      );
    }

    const { data: currentRows, error: readError } = await supabaseAdmin
      .from("raw_materials")
      .select("id, name, sku");

    if (readError) {
      console.error("Error reading existing raw materials:", readError);
      const isMissingTable =
        readError.code === "PGRST205" ||
        readError.message?.toLowerCase().includes("schema cache") ||
        readError.message?.toLowerCase().includes("does not exist");

      const errorMsg = isMissingTable
        ? "The 'raw_materials' table does not exist in your database yet. Run the setup SQL script in your Supabase SQL Editor to enable raw materials inventory."
        : readError.message;

      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    const bySku = new Map<string, { id: number; name: string }>();
    const byName = new Map<string, { id: number; name: string }>();
    const usedSkus = new Set<string>();
    for (const row of (currentRows ?? []) as RawMaterialDbRow[]) {
      const entry = { id: Number(row.id), name: row.name };
      if (row.sku) {
        bySku.set(row.sku.toLowerCase(), entry);
        usedSkus.add(row.sku);
      }
      byName.set(normalise(row.name), entry);
    }

    const inserts: Record<string, unknown>[] = [];
    const updates: { id: number; patch: Record<string, unknown> }[] = [];
    const results: RowResult[] = [];
    /** Existing rows already targeted for update in this run, by normalised name. */
    const claimedExisting = new Map<string, { id: number; name: string }>();
    /** Every name seen in this file, including ones we are inserting. */
    const seenNames = new Set<string>();

    items.forEach((item, index) => {
      const name = typeof item?.name === "string" ? item.name.trim() : "";
      if (!name) {
        results.push({ index, name: "", action: "skipped", error: "Material name is required" });
        return;
      }

      const key = normalise(name);
      const skuKey = item.sku?.trim().toLowerCase();
      // A repeated name inside one file must resolve to the row we already
      // queued, otherwise the second occurrence would create a duplicate.
      const existing =
        claimedExisting.get(key) ??
        (skuKey ? bySku.get(skuKey) : undefined) ??
        byName.get(key) ??
        undefined;
      const isRepeat = seenNames.has(key);
      seenNames.add(key);

      const row: Record<string, unknown> = {
        name,
        category: item.category?.trim() || "General",
        stock: Math.max(0, toNumber(item.stock)),
        unit: item.unit || "kg",
        min_threshold: Math.max(0, toNumber(item.minThreshold, 5)),
        cost_per_unit: Math.max(0, toNumber(item.costPerUnit)),
        supplier: item.supplier?.trim() || null,
        is_active: true,
      };

      if (existing) {
        // Later rows supersede earlier ones, so keep one update per id.
        const prior = updates.findIndex((u) => u.id === existing.id);
        if (prior >= 0) updates[prior] = { id: existing.id, patch: row };
        else updates.push({ id: existing.id, patch: row });
        claimedExisting.set(key, existing);
        results.push({
          index,
          name,
          action: "updated",
          id: existing.id,
          ...(isRepeat ? { note: "Duplicate name in file; last row used" } : {}),
        });
      } else {
        const sku = item.sku?.trim() || makeSku(name, usedSkus, new Set(bySku.keys()));
        inserts.push({ ...row, sku });
        results.push({
          index,
          name,
          action: "created",
          ...(isRepeat ? { note: "Duplicate name in file; last row used" } : {}),
        });
      }
    });

    // Apply updates before inserts so a newly generated SKU can never collide
    // with a SKU that an update is about to free up.
    const failed: RowResult[] = [];

    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from("raw_materials")
        .update(update.patch)
        .eq("id", update.id);
      if (error) {
        const result = results.find((r) => r.id === update.id && r.action === "updated");
        if (result) {
          result.action = "skipped";
          result.error = error.message;
          failed.push(result);
        }
      }
    }

    let insertedIds: number[] = [];
    if (inserts.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("raw_materials")
        .insert(inserts)
        .select("id");
      if (error) {
        console.error("Bulk insert failed:", error);
        for (const result of results.filter((r) => r.action === "created")) {
          result.action = "skipped";
          result.error = error.message;
          failed.push(result);
        }
      } else {
        insertedIds = ((data ?? []) as { id: number | string }[]).map((row) => Number(row.id));
        let cursor = 0;
        for (const result of results) {
          if (result.action === "created") {
            result.id = insertedIds[cursor];
            cursor += 1;
          }
        }
      }
    }

    const { data: finalRows, error: finalError } = await supabaseAdmin
      .from("raw_materials")
      .select("id, name, sku, category, stock, unit, min_threshold, cost_per_unit, supplier")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (finalError) {
      console.error("Error re-reading raw materials after bulk import:", finalError);
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        created: results.filter((r) => r.action === "created").length,
        updated: results.filter((r) => r.action === "updated").length,
        skipped: results.filter((r) => r.action === "skipped").length,
      },
      rawMaterials: ((finalRows ?? []) as RawMaterialDbRow[]).map((row) => ({
        id: Number(row.id),
        name: row.name,
        sku: row.sku,
        category: row.category,
        stock: toNumber(row.stock),
        unit: row.unit,
        minThreshold: toNumber(row.min_threshold, 5),
        costPerUnit: toNumber(row.cost_per_unit),
        supplier: row.supplier ?? undefined,
      })),
    });
  } catch (err) {
    console.error("API error in POST /api/raw-materials/bulk:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}
