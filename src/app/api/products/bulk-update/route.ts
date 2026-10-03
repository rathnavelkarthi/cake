import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface BulkUpdateItem {
  id?: string;
  sku?: string;
  name?: string;
  slug?: string;
  price?: number;
  salePrice?: number | null;
  stock?: number;
  lowStockThreshold?: number;
  category?: string;
  description?: string;
  isEggless?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  imageUrl?: string;
  productType?: string;
  availableBranches?: string;
  branchIds?: string[];
}

export interface UpdateRowResult {
  index: number;
  id?: string;
  sku?: string;
  name: string;
  action: "updated" | "skipped";
  changedFields?: string[];
  error?: string;
}

function normaliseName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * POST /api/products/bulk-update
 *
 * Partial update (PATCH semantics) for products.
 * Matches products by explicit ID, SKU, Slug, or normalized Name.
 * Only overwrites fields that are explicitly provided in each item.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: BulkUpdateItem[] = Array.isArray(body?.items) ? body.items : [];
    const fileName = body?.fileName || "bulk-update";

    if (items.length === 0) {
      return NextResponse.json({ error: "No update items supplied" }, { status: 400 });
    }
    if (items.length > 1000) {
      return NextResponse.json(
        { error: "Too many items in one update. Maximum is 1000 items per request." },
        { status: 400 }
      );
    }

    // Read existing products
    const { data: existingRows, error: readError } = await supabaseAdmin
      .from("products")
      .select("*");

    if (readError) {
      console.error("Error reading products for bulk-update:", readError);
      return NextResponse.json({ error: readError.message }, { status: 500 });
    }

    const byId = new Map<string, any>();
    const bySku = new Map<string, any>();
    const bySlug = new Map<string, any>();
    const byName = new Map<string, any>();

    for (const row of existingRows ?? []) {
      if (row.id) byId.set(String(row.id), row);
      if (row.sku) bySku.set(String(row.sku).toLowerCase().trim(), row);
      if (row.slug) bySlug.set(String(row.slug).trim(), row);
      if (row.name) byName.set(normaliseName(row.name), row);
    }

    const results: UpdateRowResult[] = [];
    const updatePromises: Promise<any>[] = [];

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const rawSku = item.sku?.trim().toLowerCase();
      const rawSlug = item.slug?.trim() || (item.name ? slugify(item.name) : "");
      const rawName = item.name ? normaliseName(item.name) : "";

      // Match target
      let target: any = undefined;
      if (item.id && byId.has(String(item.id))) {
        target = byId.get(String(item.id));
      } else if (rawSku && bySku.has(rawSku)) {
        target = bySku.get(rawSku);
      } else if (rawSlug && bySlug.has(rawSlug)) {
        target = bySlug.get(rawSlug);
      } else if (rawName && byName.has(rawName)) {
        target = byName.get(rawName);
      }

      if (!target) {
        results.push({
          index,
          sku: item.sku,
          name: item.name || "Unknown item",
          action: "skipped",
          error: `No existing product found matching SKU "${item.sku || ""}" or Name "${item.name || ""}"`,
        });
        continue;
      }

      // Build partial patch with ONLY provided fields
      const patch: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      const changedFields: string[] = [];

      if (item.name !== undefined && item.name.trim() !== "" && item.name !== target.name) {
        patch.name = item.name.trim();
        changedFields.push("name");
      }

      if (item.price !== undefined && Number.isFinite(Number(item.price)) && Number(item.price) >= 0) {
        patch.price = Number(item.price);
        changedFields.push("price");
      }

      if (item.salePrice !== undefined) {
        if (item.salePrice === null || item.salePrice === 0) {
          patch.sale_price = null;
          changedFields.push("salePrice");
        } else if (Number.isFinite(Number(item.salePrice))) {
          patch.sale_price = Number(item.salePrice);
          changedFields.push("salePrice");
        }
      }

      if (item.stock !== undefined && Number.isFinite(Number(item.stock))) {
        patch.stock_quantity = Math.max(0, Math.round(Number(item.stock)));
        changedFields.push("stock");
      }

      if (item.lowStockThreshold !== undefined && Number.isFinite(Number(item.lowStockThreshold))) {
        patch.low_stock_threshold = Math.max(0, Math.round(Number(item.lowStockThreshold)));
        changedFields.push("lowStockThreshold");
      }

      if (item.category !== undefined && item.category.trim() !== "") {
        patch.category_name = item.category.trim();
        patch.category_id = slugify(item.category.trim());
        changedFields.push("category");
      }

      if (item.description !== undefined && item.description.trim() !== "") {
        patch.description = item.description.trim();
        patch.short_description = item.description.trim().slice(0, 140);
        changedFields.push("description");
      }

      if (item.isActive !== undefined) {
        patch.is_active = Boolean(item.isActive);
        changedFields.push("isActive");
      }

      if (item.isEggless !== undefined) {
        patch.is_eggless = Boolean(item.isEggless);
        changedFields.push("isEggless");
      }

      if (item.isFeatured !== undefined) {
        patch.is_featured = Boolean(item.isFeatured);
        changedFields.push("isFeatured");
      }

      if (item.isBestSeller !== undefined) {
        patch.is_bestseller = Boolean(item.isBestSeller);
        changedFields.push("isBestSeller");
      }

      if (item.imageUrl !== undefined && item.imageUrl.trim() !== "") {
        patch.image_url = item.imageUrl.trim();
        changedFields.push("imageUrl");
      }

      if (item.productType !== undefined && item.productType.trim() !== "") {
        patch.product_type = item.productType.trim();
        changedFields.push("productType");
      }

      if (item.availableBranches !== undefined) {
        patch.available_branches = item.availableBranches;
        changedFields.push("availableBranches");
      }

      if (Array.isArray(item.branchIds) && item.branchIds.length > 0) {
        patch.branch_ids = item.branchIds;
        changedFields.push("branchIds");
      }

      // Execute update
      const doUpdate = async () => {
        const { error: updateErr } = await supabaseAdmin
          .from("products")
          .update(patch)
          .eq("id", target.id);

        if (updateErr) {
          console.error(`Failed to update product ${target.id}:`, updateErr);
          results.push({
            index,
            id: target.id,
            sku: target.sku,
            name: target.name,
            action: "skipped",
            error: updateErr.message,
          });
        } else {
          results.push({
            index,
            id: target.id,
            sku: target.sku,
            name: target.name,
            action: "updated",
            changedFields,
          });
        }
      };

      updatePromises.push(doUpdate());
    }

    await Promise.all(updatePromises);

    // Sort results by original index
    results.sort((a, b) => a.index - b.index);

    const summary = {
      total: items.length,
      updated: results.filter((r) => r.action === "updated").length,
      skipped: results.filter((r) => r.action === "skipped").length,
    };

    // Log to bulk_import_jobs
    try {
      await supabaseAdmin.from("bulk_import_jobs").insert([
        {
          id: `bij-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          mode: "products-update",
          file_name: fileName,
          total_rows: items.length,
          created_count: 0,
          updated_count: summary.updated,
          skipped_count: summary.skipped,
          error_count: summary.skipped,
          warning_count: 0,
          status: summary.skipped > 0 ? "partial" : "completed",
          summary,
          error_log: results.filter((r) => r.action === "skipped"),
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.warn("Could not log job to bulk_import_jobs table:", e);
    }

    return NextResponse.json({
      success: true,
      results,
      summary,
    });
  } catch (err) {
    console.error("API error in POST /api/products/bulk-update:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}
