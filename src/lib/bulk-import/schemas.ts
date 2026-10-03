/**
 * Column definitions and row validation for bulk import.
 *
 * Every column accepts several spellings because staff will rename things in
 * Excel ("Product Name", "product_name", "Name" all land on the same field).
 * Validation is intentionally forgiving: a bad number or a missing optional
 * column is a warning, only a genuinely unusable row blocks the import.
 */

import type { RecipeIngredient, RawMaterialItem } from "@/lib/db/admin-data";

export type ImportMode = "products" | "raw-materials";

export type RowSeverity = "error" | "warning";

export interface RowIssue {
  field: string;
  message: string;
  severity: RowSeverity;
}

export interface FieldDiffItem {
  field: string;
  label: string;
  oldValue: string;
  newValue: string;
}

export interface ParsedRow<T> {
  /** 1-based row number in the sheet, header included. */
  rowNumber: number;
  /** Raw cells, kept so the preview can show exactly what was in the file. */
  raw: Record<string, string>;
  value: T | null;
  issues: RowIssue[];
  /** How this row will be applied once confirmed. */
  action: "create" | "update" | "skip";
  /** Set for updates: the id of the record that will be overwritten. */
  existingId?: string | number;
  existingLabel?: string;
  /** Field-level differences for updates, e.g. "Price ₹40 → ₹45" */
  diffs?: FieldDiffItem[];
  /** Raw material names in the recipe that do not exist yet. */
  unknownIngredients: string[];
}

export interface ColumnSpec {
  key: string;
  label: string;
  aliases: string[];
  required?: boolean;
  example: string;
  help: string;
}

/* -------------------------------------------------------------------------- */
/* Shared coercion helpers                                                     */
/* -------------------------------------------------------------------------- */

export function pick(
  record: Record<string, string>,
  aliases: string[]
): string | undefined {
  for (const alias of aliases) {
    const value = record[alias];
    if (value !== undefined && value.trim() !== "") return value.trim();
  }
  return undefined;
}

const TRUE_WORDS = new Set([
  "y", "yes", "true", "1", "veg", "vegetarian", "eggless", "pureveg", "pure veg", "v",
]);
const FALSE_WORDS = new Set([
  "n", "no", "false", "0", "nonveg", "non veg", "non-veg", "egg", "contains egg", "with egg",
]);

export function parseBoolean(value: string | undefined, fallback: boolean): boolean | null {
  if (value === undefined) return fallback;
  const token = value.trim().toLowerCase();
  if (token === "") return fallback;
  if (TRUE_WORDS.has(token)) return true;
  if (FALSE_WORDS.has(token)) return false;
  return null;
}

export function parseNumber(
  value: string | undefined,
  fallback: number
): { value: number; invalid: boolean } {
  if (value === undefined || value.trim() === "") return { value: fallback, invalid: false };
  // Strip currency symbols and thousands separators: "1,250.00" and "₹750".
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed)) return { value: fallback, invalid: true };
  return { value: parsed, invalid: false };
}

export const RAW_UNITS = ["kg", "l", "pcs"] as const;
export type RawUnit = (typeof RAW_UNITS)[number];

export function parseUnit(value: string | undefined, fallback: RawUnit = "kg"): RawUnit | null {
  if (value === undefined || value.trim() === "") return fallback;
  const token = value.trim().toLowerCase();
  if ((RAW_UNITS as readonly string[]).includes(token)) return token as RawUnit;
  // Accept the spelled-out and common short forms staff actually type.
  if (token.startsWith("kilo")) return "kg";
  if (token.startsWith("litre") || token.startsWith("liter") || token === "lt") return "l";
  if (token.startsWith("piece") || token.startsWith("count") || token === "nos" || token === "unit") {
    return "pcs";
  }
  return null;
}

// Single kitchen, so "all" and the branch id both resolve to the same outlet.
export const BRANCHES = ["all", "nungambakkam"] as const;

export function parseBranch(
  value: string | undefined
): { value: string; invalid: boolean } {
  if (value === undefined || value.trim() === "") return { value: "all", invalid: false };
  const token = value.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (token === "all" || token === "both" || token === "") return { value: "all", invalid: false };
  // "harrisons" was a retired counter. Map it rather than flagging the row, so
  // older spreadsheets still import cleanly.
  if (
    token.startsWith("nungambakkam") ||
    token.startsWith("casablanca") ||
    token.startsWith("harrison")
  ) {
    return { value: "nungambakkam", invalid: false };
  }
  return { value: "all", invalid: true };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* -------------------------------------------------------------------------- */
/* Recipe parsing                                                              */
/* -------------------------------------------------------------------------- */

/** "54% Callebaut Dark Belgian Chocolate 300g" -> { name, amount, unit } */
const RECIPE_PART = /^(.*?)[\s]*([0-9]+(?:\.[0-9]+)?)\s*(g|kg|ml|l|pcs)?\s*$/i;

export interface RecipePart {
  name: string;
  amount: number;
  unit: "g" | "kg" | "ml" | "l" | "pcs";
}

/**
 * Splits the recipe cell on ;, | or newlines, then pulls a trailing
 * "<amount><unit>" off each ingredient name.
 */
export function parseRecipeCell(cell: string): { parts: RecipePart[]; unparsed: string[] } {
  const parts: RecipePart[] = [];
  const unparsed: string[] = [];

  const chunks = cell
    .split(/[;|\n]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  for (const chunk of chunks) {
    const match = RECIPE_PART.exec(chunk);
    if (!match) {
      unparsed.push(chunk);
      continue;
    }
    const [, rawName, rawAmount, rawUnit] = match;
    const name = rawName.trim();
    if (!name) {
      unparsed.push(chunk);
      continue;
    }
    const amount = Number.parseFloat(rawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      unparsed.push(chunk);
      continue;
    }
    parts.push({
      name,
      amount,
      unit: (rawUnit?.toLowerCase() as RecipePart["unit"]) ?? "g",
    });
  }

  return { parts, unparsed };
}

function normaliseName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Resolves a typed ingredient name onto a raw material row.
 * Exact match first, then "one contains the other", then token overlap.
 */
export function matchRawMaterial(
  name: string,
  catalogue: RawMaterialItem[]
): RawMaterialItem | undefined {
  const target = normaliseName(name);
  if (!target) return undefined;

  const exact = catalogue.find((r) => normaliseName(r.name) === target);
  if (exact) return exact;

  const partial = catalogue.find((r) => {
    const candidate = normaliseName(r.name);
    return target.includes(candidate) || candidate.includes(target);
  });
  if (partial) return partial;

  const targetTokens = new Set(target.split(" ").filter((t) => t.length > 2));
  if (targetTokens.size === 0) return undefined;

  let best: RawMaterialItem | undefined;
  let bestScore = 0;
  for (const candidate of catalogue) {
    const tokens = normaliseName(candidate.name).split(" ").filter((t) => t.length > 2);
    let score = 0;
    for (const token of tokens) {
      if (targetTokens.has(token)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  // Require more than half the significant tokens to line up, so
  // "Sugar" does not silently bind to "Brown Sugar Syrup".
  return bestScore >= Math.max(2, Math.ceil(targetTokens.size / 2)) ? best : undefined;
}

/** Converts parsed recipe parts into store recipe rows, flagging unknowns. */
export function buildRecipe(
  cell: string,
  catalogue: RawMaterialItem[]
): { recipe: RecipeIngredient[]; unknown: string[]; unparsed: string[] } {
  const { parts, unparsed } = parseRecipeCell(cell);
  const recipe: RecipeIngredient[] = [];
  const unknown: string[] = [];
  const seen = new Set<number>();

  for (const part of parts) {
    const match = matchRawMaterial(part.name, catalogue);
    if (!match) {
      unknown.push(`${part.name} (${part.amount}${part.unit})`);
      continue;
    }
    if (seen.has(match.id)) continue; // de-dupe repeated ingredient names
    seen.add(match.id);
    recipe.push({
      rawMaterialId: match.id,
      rawMaterialName: match.name,
      amount: part.amount,
      unit: part.unit,
    });
  }

  return { recipe, unknown, unparsed };
}

/* -------------------------------------------------------------------------- */
/* Product columns                                                             */
/* -------------------------------------------------------------------------- */

export const PRODUCT_COLUMNS: ColumnSpec[] = [
  {
    key: "name",
    label: "Product Name",
    aliases: ["name", "product_name", "product", "item", "title"],
    required: true,
    example: "Belgian Chocolate Truffle",
    help: "Shown to customers. Also used to build the product URL.",
  },
  {
    key: "sku",
    label: "SKU",
    aliases: ["sku", "item_code", "code"],
    example: "KCH-1001",
    help: "Optional. Leave blank and we generate one. Used to match updates on re-upload.",
  },
  {
    key: "category",
    label: "Category",
    aliases: ["category", "menu_category", "type"],
    example: "Cakes",
    help: "New categories are created automatically.",
  },
  {
    key: "price",
    label: "Selling Price",
    aliases: ["price", "selling_price", "mrp", "rate", "amount"],
    required: true,
    example: "750",
    help: "Required. Currency symbols and thousands separators are ignored.",
  },
  {
    key: "sale_price",
    label: "Sale Price",
    aliases: ["sale_price", "discounted_price", "offer_price"],
    example: "649",
    help: "Optional. Leave blank if the item is not on offer.",
  },
  {
    key: "stock",
    label: "Stock Quantity",
    aliases: ["stock", "stock_quantity", "quantity", "qty", "available"],
    example: "10",
    help: "Finished units on hand. Blank is treated as 0.",
  },
  {
    key: "low_stock_threshold",
    label: "Low Stock Alert",
    aliases: ["low_stock_threshold", "low_stock", "threshold", "alert_at"],
    example: "5",
    help: "Shows the Low Stock badge at or below this number.",
  },
  {
    key: "description",
    label: "Description",
    aliases: ["description", "details", "about", "recipe_story"],
    example: "Dense fudge brownie baked with brown butter.",
    help: "Optional. Keep it short, it is shown on the product page.",
  },
  {
    key: "is_eggless",
    label: "Veg / Non-Veg",
    aliases: ["is_eggless", "veg", "diet", "dietary", "food_type"],
    example: "veg",
    help: "Accepts veg / nonveg / yes / no. Drives the green veg mark on menus and bills.",
  },
  {
    key: "is_active",
    label: "Visible on Site",
    aliases: ["is_active", "active", "visible", "published", "status"],
    example: "yes",
    help: "Blank defaults to yes. Set to no to keep a product hidden.",
  },
  {
    key: "is_featured",
    label: "Featured",
    aliases: ["is_featured", "featured", "star"],
    example: "no",
    help: "Optional. Featured items surface on the homepage.",
  },
  {
    key: "is_bestseller",
    label: "Best Seller",
    aliases: ["is_bestseller", "bestseller", "best_seller"],
    example: "no",
    help: "Optional.",
  },
  {
    key: "image",
    label: "Photo Filename",
    aliases: ["image", "image_url", "photo", "image_file", "picture"],
    example: "belgian-chocolate-truffle.jpg",
    help: "Optional. Matches a selected photo by filename or by product name.",
  },
  {
    key: "product_type",
    label: "Product Type",
    aliases: ["product_type", "type", "item_type"],
    example: "FINISHED_PRODUCT",
    help: "FINISHED_PRODUCT or RAW_MATERIAL. Defaults to FINISHED_PRODUCT.",
  },
  {
    key: "outlet",
    label: "Outlet",
    aliases: ["outlet", "branch", "branch_ids", "available_branches", "location"],
    example: "all",
    help: "Leave blank or use 'all' for the Casablanca Studio kitchen.",
  },
  {
    key: "recipe",
    label: "Recipe",
    aliases: ["recipe", "ingredients", "bom", "bill_of_materials", "composition"],
    example: "Belgian Chocolate 300g; Butter 180g; Sugar 150g",
    help: "Per single unit. Separate ingredients with ; and write the amount at the end.",
  },
];

export interface ParsedProduct {
  name: string;
  sku?: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  lowStockThreshold: number;
  description?: string;
  isEggless: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  image?: string;
  productType?: "FINISHED_PRODUCT" | "RAW_MATERIAL" | "SEMI_FINISHED";
  availableBranches: string;
  branchIds: string[];
  recipe: RecipeIngredient[];
  slug: string;
}

const PRODUCT_ALIAS = Object.fromEntries(
  PRODUCT_COLUMNS.flatMap((column) => column.aliases.map((alias) => [alias, column.key]))
) as Record<string, string>;

/** Re-keys a normalised record onto our canonical field names. */
export function canonicalise(
  record: Record<string, string>,
  aliasMap: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    const target = aliasMap[key];
    if (target && out[target] === undefined) out[target] = value;
  }
  return out;
}

export interface ProductRefInfo {
  id: string;
  name: string;
  sku: string | null;
  slug: string;
  price?: number;
  salePrice?: number;
  stock?: number;
  lowStockThreshold?: number;
  category?: string;
  description?: string;
  isActive?: boolean;
  isEggless?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  productType?: string;
  imageUrl?: string;
}

export interface ProductParseContext {
  rowNumber: number;
  raw: Record<string, string>;
  catalogue: RawMaterialItem[];
  existingProducts: ProductRefInfo[];
  autoCreateIngredients: boolean;
  mode?: "all" | "update-only" | "create-only";
}

export function parseProductRow(context: ProductParseContext): ParsedRow<ParsedProduct> {
  const { rowNumber, raw, catalogue, existingProducts, autoCreateIngredients, mode = "all" } = context;
  const record = canonicalise(raw, PRODUCT_ALIAS);
  const issues: RowIssue[] = [];

  const rawSku = record.sku?.trim();
  const rawName = record.name?.trim() ?? "";

  // Find existing product by SKU first, then by slug, then by name
  let match: ProductRefInfo | undefined;
  if (rawSku) {
    match = existingProducts.find((p) => p.sku && p.sku.toLowerCase() === rawSku.toLowerCase());
  }
  if (!match && rawName) {
    const slug = slugify(rawName);
    match = existingProducts.find(
      (p) => p.slug === slug || p.name.toLowerCase() === rawName.toLowerCase()
    );
  }

  // In update-only mode, if name is missing but SKU matched an existing product, inherit the existing name
  const name = rawName || (mode === "update-only" && match ? match.name : "");
  if (!name) {
    issues.push({ field: "name", message: "Product Name is required", severity: "error" });
  }

  // Handle price: in update-only mode with a match, default to existing price if not provided
  let price = parseNumber(record.price, match?.price ?? 0);
  if (record.price === undefined && mode === "update-only" && match?.price !== undefined) {
    price = { value: match.price, invalid: false };
  } else if (price.invalid || (record.price === undefined && mode !== "update-only")) {
    issues.push({
      field: "price",
      message: record.price === undefined
        ? "Selling Price is required"
        : `"${record.price}" is not a number`,
      severity: "error",
    });
  } else if (price.value < 0) {
    issues.push({ field: "price", message: "Selling Price cannot be negative", severity: "error" });
  }

  const salePrice = parseNumber(record.sale_price, match?.salePrice ?? 0);
  if (record.sale_price !== undefined && salePrice.invalid) {
    issues.push({
      field: "sale_price",
      message: `"${record.sale_price}" is not a number, ignoring offer price`,
      severity: "warning",
    });
  }
  if (!salePrice.invalid && salePrice.value > 0 && salePrice.value >= price.value) {
    issues.push({
      field: "sale_price",
      message: "Offer price is not lower than Selling Price, ignoring it",
      severity: "warning",
    });
  }

  const stock = parseNumber(record.stock, match?.stock ?? 0);
  if (stock.invalid || stock.value < 0) {
    issues.push({
      field: "stock",
      message: record.stock === undefined || record.stock === ""
        ? "Stock blank, set to 0"
        : `Stock "${record.stock}" is not a number, set to 0`,
      severity: "warning",
    });
  }

  const threshold = parseNumber(record.low_stock_threshold, match?.lowStockThreshold ?? 5);
  if (threshold.invalid) {
    issues.push({
      field: "low_stock_threshold",
      message: `Low Stock Alert "${record.low_stock_threshold}" is not a number, set to 5`,
      severity: "warning",
    });
  }

  const eggless = parseBoolean(record.is_eggless, match?.isEggless ?? true);
  if (eggless === null) {
    issues.push({
      field: "is_eggless",
      message: `"${record.is_eggless}" is not veg/non-veg, treating as veg`,
      severity: "warning",
    });
  }

  const active = parseBoolean(record.is_active, match?.isActive ?? true);
  if (active === null) {
    issues.push({
      field: "is_active",
      message: `"${record.is_active}" is not yes/no, treating as visible`,
      severity: "warning",
    });
  }

  const branch = parseBranch(record.outlet);
  if (branch.invalid) {
    issues.push({
      field: "outlet",
      message: `Unknown outlet "${record.outlet}", set to all outlets`,
      severity: "warning",
    });
  }

  let unknownIngredients: string[] = [];
  let recipe: RecipeIngredient[] = [];
  let unparsed: string[] = [];
  if (record.recipe && record.recipe.trim()) {
    const built = buildRecipe(record.recipe, catalogue);
    recipe = built.recipe;
    unknownIngredients = built.unknown;
    unparsed = built.unparsed;

    if (unparsed.length > 0) {
      issues.push({
        field: "recipe",
        message: `Could not read "${unparsed.join(", ")}" - expected "Ingredient 300g"`,
        severity: "warning",
      });
    }
    if (unknownIngredients.length > 0) {
      issues.push({
        field: "recipe",
        message: autoCreateIngredients
          ? `New ingredients will be created: ${unknownIngredients.join(", ")}`
          : `Unknown ingredients, recipe dropped: ${unknownIngredients.join(", ")}`,
        severity: "warning",
      });
    }
  }

  const slug = match?.slug || slugify(name);
  if (name && !slug) {
    issues.push({
      field: "name",
      message: "Product Name has no letters or numbers usable in a URL",
      severity: "error",
    });
  }

  // Parse product_type
  let productType: "FINISHED_PRODUCT" | "RAW_MATERIAL" | "SEMI_FINISHED" = "FINISHED_PRODUCT";
  if (record.product_type) {
    const rawType = record.product_type.trim().toUpperCase().replace(/[\s-]/g, "_");
    if (rawType.includes("RAW") || rawType.includes("INGREDIENT")) {
      productType = "RAW_MATERIAL";
    } else if (rawType.includes("SEMI")) {
      productType = "SEMI_FINISHED";
    } else {
      productType = "FINISHED_PRODUCT";
    }
  }

  const sku = rawSku || match?.sku || undefined;
  const existingId = match?.id;
  const existingLabel = match?.name;

  // Mode restrictions
  if (mode === "update-only" && !existingId) {
    issues.push({
      field: "sku",
      message: `No existing product matched SKU "${rawSku || ""}" or Name "${rawName}". Updates only apply to existing items.`,
      severity: "error",
    });
  } else if (mode === "create-only" && existingId) {
    issues.push({
      field: "name",
      message: `Product "${existingLabel}" already exists (SKU: ${match?.sku || "none"}). Skipped in create-only mode.`,
      severity: "warning",
    });
  }

  // Calculate field-level diffs if updating an existing record
  const diffs: FieldDiffItem[] = [];
  if (match) {
    if (record.price !== undefined && Number(price.value) !== Number(match.price)) {
      diffs.push({
        field: "price",
        label: "Selling Price",
        oldValue: match.price !== undefined ? `₹${match.price}` : "—",
        newValue: `₹${price.value}`,
      });
    }
    if (record.stock !== undefined && Number(stock.value) !== Number(match.stock)) {
      diffs.push({
        field: "stock",
        label: "Stock",
        oldValue: match.stock !== undefined ? String(match.stock) : "—",
        newValue: String(stock.value),
      });
    }
    if (record.sale_price !== undefined) {
      const oldSale = match.salePrice ? `₹${match.salePrice}` : "None";
      const newSale = salePrice.value > 0 ? `₹${salePrice.value}` : "None";
      if (oldSale !== newSale) {
        diffs.push({ field: "sale_price", label: "Sale Price", oldValue: oldSale, newValue: newSale });
      }
    }
    if (record.category && match.category && record.category.trim().toLowerCase() !== match.category.toLowerCase()) {
      diffs.push({
        field: "category",
        label: "Category",
        oldValue: match.category,
        newValue: record.category.trim(),
      });
    }
    if (record.is_active !== undefined && match.isActive !== undefined && (active ?? true) !== match.isActive) {
      diffs.push({
        field: "is_active",
        label: "Visibility",
        oldValue: match.isActive ? "Visible" : "Hidden",
        newValue: active ? "Visible" : "Hidden",
      });
    }
    if (record.is_eggless !== undefined && match.isEggless !== undefined && (eggless ?? true) !== match.isEggless) {
      diffs.push({
        field: "is_eggless",
        label: "Veg Mark",
        oldValue: match.isEggless ? "Veg" : "Non-Veg",
        newValue: eggless ? "Veg" : "Non-Veg",
      });
    }
  }

  const hasError = issues.some((issue) => issue.severity === "error");
  if (hasError) {
    return { rowNumber, raw, value: null, issues, action: "skip", unknownIngredients, diffs };
  }

  const value: ParsedProduct = {
    name,
    sku,
    category: record.category?.trim() || match?.category || "Signature Cakes",
    price: price.value,
    salePrice: !salePrice.invalid && salePrice.value > 0 && salePrice.value < price.value
      ? salePrice.value
      : undefined,
    stock: Number.isFinite(stock.value) ? Math.max(0, Math.round(stock.value)) : 0,
    lowStockThreshold: Number.isFinite(threshold.value)
      ? Math.max(0, Math.round(threshold.value))
      : 5,
    description: record.description?.trim() || match?.description || undefined,
    isEggless: eggless ?? true,
    isActive: active ?? true,
    isFeatured: parseBoolean(record.is_featured, match?.isFeatured ?? false) ?? false,
    isBestSeller: parseBoolean(record.is_bestseller, match?.isBestSeller ?? false) ?? false,
    image: record.image?.trim() || match?.imageUrl || undefined,
    productType,
    availableBranches: branch.value,
    branchIds: ["nungambakkam"],
    recipe,
    slug,
  };

  let action: "create" | "update" | "skip" = existingId ? "update" : "create";
  if (mode === "create-only" && existingId) {
    action = "skip";
  }

  return {
    rowNumber,
    raw,
    value,
    issues,
    action,
    existingId,
    existingLabel,
    diffs,
    unknownIngredients,
  };
}

/* -------------------------------------------------------------------------- */
/* Raw material columns                                                        */
/* -------------------------------------------------------------------------- */

export const RAW_MATERIAL_COLUMNS: ColumnSpec[] = [
  {
    key: "name",
    label: "Material Name",
    aliases: ["name", "material", "material_name", "ingredient", "item", "raw_material"],
    required: true,
    example: "Refined Wheat Flour (Maida)",
    help: "Must match the name used in a product recipe for the link to resolve.",
  },
  {
    key: "sku",
    label: "SKU",
    aliases: ["sku", "code", "item_code"],
    example: "RAW-FLOUR-01",
    help: "Optional. Leave blank and we generate one.",
  },
  {
    key: "category",
    label: "Category",
    aliases: ["category", "group", "type"],
    example: "Flours & Grains",
    help: "Groups the item on the Raw Materials tab.",
  },
  {
    key: "stock",
    label: "Opening Stock",
    aliases: ["stock", "quantity", "qty", "opening_stock", "available"],
    example: "50",
    help: "How much is on hand, in the base unit below.",
  },
  {
    key: "unit",
    label: "Unit",
    aliases: ["unit", "uom", "base_unit", "measurement"],
    example: "kg",
    help: "kg / l / pcs. Default kg.",
  },
  {
    key: "min_threshold",
    label: "Low Stock Alert",
    aliases: ["min_threshold", "low_stock", "threshold", "reorder_level", "min_stock"],
    example: "15",
    help: "Shows Low Stock at or below this level.",
  },
  {
    key: "cost_per_unit",
    label: "Cost Per Unit",
    aliases: ["cost_per_unit", "cost", "unit_cost", "price", "rate"],
    example: "48",
    help: "Optional. Used for recipe costing.",
  },
  {
    key: "supplier",
    label: "Supplier",
    aliases: ["supplier", "vendor", "source"],
    example: "Chennai Mill",
    help: "Optional note.",
  },
];

export interface ParsedRawMaterial {
  name: string;
  sku?: string;
  category: string;
  stock: number;
  unit: RawUnit;
  minThreshold: number;
  costPerUnit: number;
  supplier?: string;
}

const RAW_ALIAS = Object.fromEntries(
  RAW_MATERIAL_COLUMNS.flatMap((column) => column.aliases.map((alias) => [alias, column.key]))
) as Record<string, string>;

export interface RawMaterialParseContext {
  rowNumber: number;
  raw: Record<string, string>;
  existingMaterials: RawMaterialItem[];
  mode?: "all" | "update-only" | "create-only";
}

export function parseRawMaterialRow(
  context: RawMaterialParseContext
): ParsedRow<ParsedRawMaterial> {
  const { rowNumber, raw, existingMaterials, mode = "all" } = context;
  const record = canonicalise(raw, RAW_ALIAS);
  const issues: RowIssue[] = [];

  const rawSku = record.sku?.trim();
  const rawName = record.name?.trim() ?? "";

  const existing = rawSku
    ? existingMaterials.find((m) => m.sku && m.sku.toLowerCase() === rawSku.toLowerCase())
    : existingMaterials.find((m) => m.name.toLowerCase() === rawName.toLowerCase());

  const name = rawName || (mode === "update-only" && existing ? existing.name : "");
  if (!name) {
    issues.push({ field: "name", message: "Material Name is required", severity: "error" });
  } else if (existing && mode === "all") {
    issues.push({
      field: "name",
      message: `"${name}" already exists - this row will update it`,
      severity: "warning",
    });
  }

  const unit = parseUnit(record.unit, (existing?.unit as RawUnit) ?? "kg");
  if (unit === null) {
    issues.push({
      field: "unit",
      message: `Unknown unit "${record.unit}", using kg`,
      severity: "warning",
    });
  }

  const stock = parseNumber(record.stock, existing?.stock ?? 0);
  if (stock.invalid || stock.value < 0) {
    issues.push({
      field: "stock",
      message: record.stock === undefined || record.stock === ""
        ? "Opening Stock blank, set to 0"
        : `Stock "${record.stock}" is not a number, set to 0`,
      severity: "warning",
    });
  }

  const threshold = parseNumber(record.min_threshold, existing?.minThreshold ?? 5);
  if (threshold.invalid || threshold.value < 0) {
    issues.push({
      field: "min_threshold",
      message: `Low Stock Alert "${record.min_threshold}" is not usable, set to 5`,
      severity: "warning",
    });
  }

  const cost = parseNumber(record.cost_per_unit, existing?.costPerUnit ?? 0);
  if (cost.invalid || cost.value < 0) {
    issues.push({
      field: "cost_per_unit",
      message: `Cost "${record.cost_per_unit}" is not usable, set to 0`,
      severity: "warning",
    });
  }

  const sku = rawSku || existing?.sku || undefined;

  if (mode === "update-only" && !existing) {
    issues.push({
      field: "sku",
      message: `No existing raw material found matching "${rawSku || rawName}". Updates only apply to existing items.`,
      severity: "error",
    });
  } else if (mode === "create-only" && existing) {
    issues.push({
      field: "name",
      message: `Raw material "${existing.name}" already exists. Skipped in create-only mode.`,
      severity: "warning",
    });
  }

  const diffs: FieldDiffItem[] = [];
  if (existing) {
    if (record.stock !== undefined && Number(stock.value) !== Number(existing.stock)) {
      diffs.push({
        field: "stock",
        label: "Stock",
        oldValue: `${existing.stock} ${existing.unit}`,
        newValue: `${stock.value} ${unit ?? existing.unit}`,
      });
    }
    if (record.cost_per_unit !== undefined && Number(cost.value) !== Number(existing.costPerUnit)) {
      diffs.push({
        field: "cost_per_unit",
        label: "Cost / Unit",
        oldValue: `₹${existing.costPerUnit}`,
        newValue: `₹${cost.value}`,
      });
    }
    if (record.min_threshold !== undefined && Number(threshold.value) !== Number(existing.minThreshold)) {
      diffs.push({
        field: "min_threshold",
        label: "Min Threshold",
        oldValue: `${existing.minThreshold}`,
        newValue: `${threshold.value}`,
      });
    }
    if (record.supplier && existing.supplier && record.supplier.trim() !== existing.supplier) {
      diffs.push({
        field: "supplier",
        label: "Supplier",
        oldValue: existing.supplier,
        newValue: record.supplier.trim(),
      });
    }
  }

  const hasError = issues.some((issue) => issue.severity === "error");
  if (hasError) {
    return { rowNumber, raw, value: null, issues, action: "skip", unknownIngredients: [], diffs };
  }

  const value: ParsedRawMaterial = {
    name,
    sku,
    category: record.category?.trim() || existing?.category || "General",
    stock: Number.isFinite(stock.value) ? Math.max(0, stock.value) : 0,
    unit: unit ?? "kg",
    minThreshold: Number.isFinite(threshold.value) ? Math.max(0, threshold.value) : 5,
    costPerUnit: Number.isFinite(cost.value) ? Math.max(0, cost.value) : 0,
    supplier: record.supplier?.trim() || existing?.supplier || undefined,
  };

  let action: "create" | "update" | "skip" = existing ? "update" : "create";
  if (mode === "create-only" && existing) {
    action = "skip";
  }

  return {
    rowNumber,
    raw,
    value,
    issues,
    action,
    existingId: existing?.id,
    existingLabel: existing?.name,
    diffs,
    unknownIngredients: [],
  };
}

/* -------------------------------------------------------------------------- */
/* Whole-sheet parsing                                                         */
/* -------------------------------------------------------------------------- */

export interface SheetProblem {
  message: string;
  severity: RowSeverity;
}

export interface ParseSheetResult<T> {
  rows: ParsedRow<T>[];
  /** Header cells we did not recognise, so typos surface instead of vanishing. */
  unknownHeaders: string[];
  problems: SheetProblem[];
}

export function parseProductSheet(
  records: Record<string, string>[],
  context: Omit<ProductParseContext, "rowNumber" | "raw">
): ParseSheetResult<ParsedProduct> {
  const known = new Set(Object.values(PRODUCT_ALIAS));
  const unknownHeaders = collectUnknownHeaders(records, known);
  const rows = records.map((raw, index) =>
    parseProductRow({ ...context, rowNumber: index + 2, raw })
  );
  return { rows, unknownHeaders, problems: duplicateNameProblems(rows) };
}

export function parseRawMaterialSheet(
  records: Record<string, string>[],
  context: Omit<RawMaterialParseContext, "rowNumber" | "raw">
): ParseSheetResult<ParsedRawMaterial> {
  const known = new Set(Object.values(RAW_ALIAS));
  const unknownHeaders = collectUnknownHeaders(records, known);
  const rows = records.map((raw, index) =>
    parseRawMaterialRow({ ...context, rowNumber: index + 2, raw })
  );
  return { rows, unknownHeaders, problems: duplicateNameProblems(rows) };
}

function collectUnknownHeaders(
  records: Record<string, string>[],
  known: Set<string>
): string[] {
  const unknown = new Set<string>();
  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (key && !known.has(key)) unknown.add(key);
    }
  }
  return [...unknown];
}

/** Two rows for the same product in one file would make the last one win silently. */
function duplicateNameProblems<T extends { name: string }>(
  rows: ParsedRow<T>[]
): SheetProblem[] {
  const seen = new Map<string, number[]>();
  for (const row of rows) {
    if (!row.value) continue;
    const key = row.value.name.toLowerCase();
    const list = seen.get(key) ?? [];
    list.push(row.rowNumber);
    seen.set(key, list);
  }
  return [...seen.entries()]
    .filter(([, rowNumbers]) => rowNumbers.length > 1)
    .map(([name, rowNumbers]) => ({
      message: `"${name}" appears on rows ${rowNumbers.join(", ")} - only the last one will be kept`,
      severity: "warning" as const,
    }));
}

export function summarise<T>(rows: ParsedRow<T>[]) {
  return {
    total: rows.length,
    create: rows.filter((r) => r.action === "create").length,
    update: rows.filter((r) => r.action === "update").length,
    skip: rows.filter((r) => r.action === "skip").length,
    warnings: rows.reduce(
      (count, row) => count + row.issues.filter((i) => i.severity === "warning").length,
      0
    ),
    errors: rows.reduce(
      (count, row) => count + row.issues.filter((i) => i.severity === "error").length,
      0
    ),
  };
}
