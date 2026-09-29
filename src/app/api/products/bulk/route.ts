import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/products/bulk
 *
 * Upserts a whole sheet of products in one round trip instead of firing one
 * request per row, which is what makes a 100-row upload feel instant.
 *
 * Matching, in order: explicit SKU, then slug derived from the name, then
 * case-insensitive name. Rows that match update; everything else inserts.
 * Slugs and SKUs that would collide with a *different* product get a numeric
 * suffix rather than failing the whole batch.
 *
 * Body: { items: ParsedProduct[] }
 */
interface IncomingProduct {
  name: string;
  slug?: string;
  sku?: string;
  category?: string;
  price: number;
  salePrice?: number;
  stock?: number;
  lowStockThreshold?: number;
  description?: string;
  isEggless?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  imageUrl?: string;
  availableBranches?: string;
  branchIds?: string[];
  recipe?: unknown[];
}

interface RowResult {
  index: number;
  name: string;
  action: "created" | "updated" | "skipped";
  id?: string;
  error?: string;
  /** Informational, e.g. a duplicate row that was superseded. */
  note?: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normaliseName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Unique-ifies a slug that is already held by a different product. */
function uniqueSlug(base: string, taken: Set<string>, allow: string | undefined): string {
  if (!taken.has(base) || base === allow) return base;
  let counter = 2;
  while (taken.has(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}

function uniqueSku(base: string, taken: Set<string>, allow: string | undefined): string {
  if (!taken.has(base) || base === allow) return base;
  let counter = 2;
  while (taken.has(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: IncomingProduct[] = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ error: "No items supplied" }, { status: 400 });
    }
    if (items.length > 1000) {
      return NextResponse.json(
        { error: "Too many products in one upload. Split the file into batches of 1000." },
        { status: 400 }
      );
    }

    const { data: current, error: readError } = await supabaseAdmin
      .from("products")
      .select("id, name, slug, sku, image_url");

    if (readError) {
      console.error("Error reading existing products:", readError);
      return NextResponse.json({ error: readError.message }, { status: 500 });
    }

    interface ProductRef {
      id: string;
      slug: string;
      sku?: string;
      name: string;
    }

    const bySku = new Map<string, ProductRef>();
    const bySlug = new Map<string, ProductRef>();
    const byName = new Map<string, ProductRef>();
    // Detected from a real row, because the outlet columns are added by a later
    // migration and may not exist on every project.
    const hasOutletColumns = (current ?? []).some(
      (row) => "available_branches" in row && "branch_ids" in row
    );
    const takenSlugs = new Set<string>();
    const takenSkus = new Set<string>();

    for (const row of current ?? []) {
      const entry: ProductRef = {
        id: row.id,
        slug: row.slug,
        sku: row.sku ?? undefined,
        name: row.name,
      };
      if (row.slug) {
        bySlug.set(row.slug, entry);
        takenSlugs.add(row.slug);
      }
      if (row.sku) {
        bySku.set(String(row.sku).toLowerCase(), entry);
        takenSkus.add(String(row.sku));
      }
      byName.set(normaliseName(row.name), entry);
    }

    // Categories are created as needed so a new menu section never blocks an import.
    const categories = [...new Set(
      items
        .map((item) => item.category?.trim())
        .filter((value): value is string => Boolean(value))
    )];
    if (categories.length > 0) {
      await supabaseAdmin.from("categories").upsert(
        categories.map((name) => ({
          id: slugify(name),
          name,
          slug: slugify(name),
          description: `Handcrafted ${name.toLowerCase()} freshly baked in our kitchen.`,
          is_active: true,
        })),
        { onConflict: "id" }
      );
    }

    const inserts: Record<string, unknown>[] = [];
    const updates: { id: string; patch: Record<string, unknown> }[] = [];
    const results: RowResult[] = [];
    // Maps a name used earlier in this file to the row that already claimed it,
    // so a duplicated row updates the same product instead of creating a twin.
    const claimed = new Map<string, ProductRef>();
    /** Every product name seen in this file, to flag duplicates. */
    const claimedNames = new Set<string>();

    items.forEach((item, index) => {
      const name = typeof item?.name === "string" ? item.name.trim() : "";
      if (!name) {
        results.push({ index, name: "", action: "skipped", error: "Product name is required" });
        return;
      }

      const baseSlug = item.slug?.trim() || slugify(name);
      if (!baseSlug) {
        results.push({
          index,
          name,
          action: "skipped",
          error: "Product name has no letters or numbers usable in a URL",
        });
        return;
      }

      const skuKey = item.sku?.trim().toLowerCase();
      const nameKey = normaliseName(name);
      // A repeated name inside one file must resolve to the row already queued,
      // otherwise the second occurrence would create a near-duplicate product.
      const existing =
        claimed.get(nameKey) ??
        (skuKey ? bySku.get(skuKey) : undefined) ??
        bySlug.get(baseSlug) ??
        byName.get(nameKey) ??
        undefined;
      const isRepeat = claimedNames.has(nameKey);
      claimedNames.add(nameKey);

      const slug =
        existing?.slug ?? uniqueSlug(baseSlug, takenSlugs, existing?.slug);
      const sku =
        existing?.sku ?? uniqueSku(item.sku?.trim() || `KCH-${1000 + index + 1}`, takenSkus, existing?.sku);

      takenSlugs.add(slug);
      takenSkus.add(sku);

      const categoryName = item.category?.trim() || "Signature Cakes";
      const price = Number(item.price);
      if (!Number.isFinite(price) || price < 0) {
        results.push({
          index,
          name,
          action: "skipped",
          error: `Selling price "${item.price}" is not a number`,
        });
        return;
      }

      const row: Record<string, unknown> = {
        name,
        slug,
        sku,
        category_id: slugify(categoryName),
        category_name: categoryName,
        price,
        sale_price:
          typeof item.salePrice === "number" && item.salePrice > 0 && item.salePrice < price
            ? item.salePrice
            : null,
        description: item.description || `Freshly baked ${name}.`,
        short_description: item.description?.slice(0, 140) || `Freshly baked ${name}.`,
        image_url: item.imageUrl || "/images/hero-truffle.jpg",
        stock_quantity: Math.max(0, Math.round(Number(item.stock ?? 0)) || 0),
        low_stock_threshold: Math.max(0, Math.round(Number(item.lowStockThreshold ?? 5)) || 5),
        is_active: item.isActive !== false,
        is_featured: Boolean(item.isFeatured),
        is_bestseller: Boolean(item.isBestSeller),
        is_eggless: item.isEggless !== false,
        recipe: Array.isArray(item.recipe) ? item.recipe : [],
        updated_at: new Date().toISOString(),
      };

      // Outlet columns live in the 20260927 branches migration and are absent on
      // projects where it has not been applied yet. Including them only when the
      // schema actually has them keeps bulk import working either way, and the
      // single-kitchen value is written back by the migration when it lands.
      if (hasOutletColumns) {
        row.available_branches = item.availableBranches || "all";
        row.branch_ids =
          Array.isArray(item.branchIds) && item.branchIds.length > 0
            ? item.branchIds
            : ["nungambakkam"];
      }

      if (existing?.id) {
        // Later rows supersede earlier ones, so keep one update per id.
        const prior = updates.findIndex((u) => u.id === existing.id);
        if (prior >= 0) updates[prior] = { id: existing.id, patch: row };
        else updates.push({ id: existing.id, patch: row });
        bySlug.set(slug, { id: existing.id, slug, sku, name });
        byName.set(nameKey, { id: existing.id, slug, sku, name });
        claimed.set(nameKey, { id: existing.id, slug, sku, name });
        results.push({
          index,
          name,
          action: "updated",
          id: existing.id,
          ...(isRepeat ? { note: "Duplicate name in file; last row used" } : {}),
        });
      } else {
        inserts.push({
          ...row,
          id: `kch-prod-${Date.now()}-${index}`,
          images: [row.image_url],
          ingredients: ["Pure Butter", "Unbleached Flour", "Organic Sugar"],
          allergens: ["Dairy", "Gluten"],
          variants: [
            {
              id: `v-kch-${Date.now()}-${index}`,
              label: "Standard (0.5 kg)",
              weight: "0.5 kg",
              price,
              servings: "3-4 servings",
              inStock: Number(row.stock_quantity) > 0,
            },
          ],
          prep_time: "2 hours",
          created_at: new Date().toISOString(),
        });
        claimed.set(nameKey, { id: "", slug, sku, name });
        results.push({
          index,
          name,
          action: "created",
          ...(isRepeat ? { note: "Duplicate name in file; last row used" } : {}),
        });
      }
    });

    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from("products")
        .update(update.patch)
        .eq("id", update.id);
      if (error) {
        console.error(`Failed to update product ${update.id}:`, error);
        const result = results.find((r) => r.id === update.id && r.action === "updated");
        if (result) {
          result.action = "skipped";
          result.error = error.message;
        }
      }
    }

    if (inserts.length > 0) {
      const { data, error } = await supabaseAdmin.from("products").insert(inserts).select("id");
      if (error) {
        console.error("Bulk product insert failed:", error);
        for (const result of results.filter((r) => r.action === "created")) {
          result.action = "skipped";
          result.error = error.message;
        }
      } else {
        const ids = ((data ?? []) as { id: string }[]).map((row) => row.id);
        let cursor = 0;
        for (const result of results) {
          if (result.action === "created" && ids[cursor]) {
            result.id = ids[cursor];
            cursor += 1;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        created: results.filter((r) => r.action === "created").length,
        updated: results.filter((r) => r.action === "updated").length,
        skipped: results.filter((r) => r.action === "skipped").length,
      },
    });
  } catch (err) {
    console.error("API error in POST /api/products/bulk:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}
