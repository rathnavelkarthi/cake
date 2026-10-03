/**
 * Ready-to-fill CSV templates.
 *
 * Generated in the browser and downloaded as a Blob so the client never needs
 * to come back to us for "the right file". Each template ships with one worked
 * example row per column, which doubles as documentation.
 */

import { toCsv } from "./csv";
import { PRODUCT_COLUMNS, RAW_MATERIAL_COLUMNS } from "./schemas";

const PRODUCT_EXAMPLE = {
  name: "Belgian Chocolate Truffle",
  sku: "KCH-1001",
  category: "Cakes",
  price: "750",
  sale_price: "699",
  stock: "10",
  low_stock_threshold: "5",
  description:
    "Multi-layered dark chocolate sponge steeped in single-origin syrup and blanketed in Callebaut ganache.",
  is_eggless: "veg",
  is_active: "yes",
  is_featured: "yes",
  is_bestseller: "no",
  image: "belgian-chocolate-truffle.jpg",
  outlet: "all",
  recipe: "54% Callebaut Dark Belgian Chocolate 300g; Refined Wheat Flour (Maida) 250g; Unsalted Dairy Butter 180g; Granulated White Sugar 150g; Heavy Dairy Whipping Cream 200ml",
};

const PRODUCT_EXAMPLE_2 = {
  name: "Fudge Brownie",
  sku: "KCH-1002",
  category: "Brownies",
  price: "480",
  sale_price: "",
  stock: "24",
  low_stock_threshold: "6",
  description: "Dense, crackly-top fudge brownies baked with brown butter.",
  is_eggless: "veg",
  is_active: "yes",
  is_featured: "no",
  is_bestseller: "yes",
  image: "fudge-brownie.jpg",
  outlet: "nungambakkam",
  recipe: "54% Callebaut Dark Belgian Chocolate 250g; Unsalted Dairy Butter 150g; Granulated White Sugar 180g",
};

const RAW_EXAMPLE = {
  name: "Refined Wheat Flour (Maida)",
  sku: "RAW-FLOUR-01",
  category: "Flours & Grains",
  stock: "50",
  unit: "kg",
  min_threshold: "15",
  cost_per_unit: "48",
  supplier: "Chennai Mill",
};

const RAW_EXAMPLE_2 = {
  name: "Heavy Dairy Whipping Cream",
  sku: "RAW-CREAM-01",
  category: "Dairy & Fats",
  stock: "20",
  unit: "l",
  min_threshold: "5",
  cost_per_unit: "220",
  supplier: "Nilgiris",
};

function productCsv(): string {
  const headers = PRODUCT_COLUMNS.map((c) => c.label);
  const row = (example: typeof PRODUCT_EXAMPLE) =>
    PRODUCT_COLUMNS.map((c) => (example as Record<string, string>)[c.key] ?? "");
  return toCsv(headers, [row(PRODUCT_EXAMPLE), row(PRODUCT_EXAMPLE_2)]);
}

function rawMaterialCsv(): string {
  const headers = RAW_MATERIAL_COLUMNS.map((c) => c.label);
  const row = (example: typeof RAW_EXAMPLE) =>
    RAW_MATERIAL_COLUMNS.map((c) => (example as Record<string, string>)[c.key] ?? "");
  return toCsv(headers, [row(RAW_EXAMPLE), row(RAW_EXAMPLE_2)]);
}

/** A plain-English cheatsheet so nobody has to guess what a column wants. */
function instructionsText(mode: "products" | "raw-materials"): string {
  if (mode === "raw-materials") {
    return [
      "KICHEES BAKED DELIGHTS - RAW MATERIAL BULK UPLOAD",
      "===============================================",
      "",
      "1. Open the CSV in Excel or Google Sheets.",
      "2. Keep the header row exactly as it is. Column order does not matter,",
      "   and you can rename a header as long as the meaning is obvious.",
      "3. Fill one product/material per row.",
      "4. Save as CSV (UTF-8), then upload it on the Bulk Upload page.",
      "",
      "Only 'Material Name' is required. Everything else can be left blank.",
      "",
      "HOW UPDATES WORK",
      "  - Re-uploading a file updates rows whose SKU or name already exists.",
      "  - Rows with a new name are added as new items.",
      "  - A summary of what changed is shown before anything is saved.",
      "",
      "COLUMNS",
      ...RAW_MATERIAL_COLUMNS.map(
        (c) => `  ${c.label}${c.required ? " (required)" : ""}\n      ${c.help}\n      e.g. ${c.example}`
      ),
    ].join("\n");
  }

  return [
    "KICHEES BAKED DELIGHTS - PRODUCT BULK UPLOAD",
    "============================================",
    "",
    "1. Open the CSV in Excel or Google Sheets.",
    "2. Keep the header row exactly as it is. Column order does not matter,",
    "   and you can rename a header as long as the meaning is obvious.",
    "3. Fill one product per row.",
    "4. Save as CSV (UTF-8), then upload it on the Bulk Upload page.",
    "5. On the next screen, select your product photos. We match each photo to a",
    "   product by filename, so 'belgian-chocolate-truffle.jpg' lands on",
    "   'Belgian Chocolate Truffle'.",
    "",
    "Only 'Product Name' and 'Selling Price' are required.",
    "",
    "HOW UPDATES WORK",
    "  - Re-uploading a file updates rows whose SKU or name already exists.",
    "  - Rows with a new name are added as new products.",
    "  - A summary of what changed is shown before anything is saved.",
    "",
    "RECIPES (BILL OF MATERIALS)",
    "  - One cell per product, ingredients separated with a semicolon (;).",
    "  - Put the amount at the end of each ingredient: 'Butter 180g'.",
    "  - Units: g, kg, ml, l, pcs. No unit means grams.",
    "  - Ingredient names are matched to your raw materials list.",
    "  - A name we cannot match is flagged, and can be created automatically",
    "    as a new raw material during import.",
    "",
    "PHOTOS",
    "  - Select many image files at once on the upload screen.",
    "  - We match on filename first, then on product name.",
    "  - Products with no photo fall back to a standard bakery image, and you",
    "    can add the real photo later without re-uploading the file.",
    "",
    "COLUMNS",
    ...PRODUCT_COLUMNS.map(
      (c) => `  ${c.label}${c.required ? " (required)" : ""}\n      ${c.help}\n      e.g. ${c.example}`
    ),
  ].join("\n");
}

export function downloadTemplate(mode: "products" | "raw-materials", format: "csv" | "xlsx" = "csv"): void {
  const isProducts = mode === "products";
  const columns = isProducts ? PRODUCT_COLUMNS : RAW_MATERIAL_COLUMNS;
  const headers = columns.map((c) => c.label);
  const examples = isProducts
    ? [PRODUCT_EXAMPLE, PRODUCT_EXAMPLE_2]
    : [RAW_EXAMPLE, RAW_EXAMPLE_2];
  const rows = examples.map((ex) =>
    columns.map((c) => (ex as Record<string, string>)[c.key] ?? "")
  );

  if (format === "xlsx") {
    // Dynamic import / call to xlsx helper
    import("./xlsx").then(({ exportToXlsx }) => {
      exportToXlsx(headers, rows, `kichees-${mode}-template.xlsx`, mode === "products" ? "Products" : "RawMaterials");
    }).catch(() => {
      const csv = isProducts ? productCsv() : rawMaterialCsv();
      triggerDownload(csv, `kichees-${mode}-template.csv`, "text/csv;charset=utf-8");
    });
  } else {
    const csv = isProducts ? productCsv() : rawMaterialCsv();
    triggerDownload(csv, `kichees-${mode}-template.csv`, "text/csv;charset=utf-8");
  }
}

export function downloadUpdateTemplate(
  mode: "products" | "raw-materials",
  existingItems?: { sku?: string; name: string; price?: number; stock?: number; costPerUnit?: number; unit?: string }[],
  format: "csv" | "xlsx" = "csv"
): void {
  if (mode === "products") {
    const headers = ["SKU", "Product Name", "Selling Price", "Stock Quantity", "Sale Price", "Visible on Site"];
    const rows = (existingItems && existingItems.length > 0)
      ? existingItems.map((p) => [
          p.sku || "",
          p.name,
          p.price !== undefined ? String(p.price) : "",
          p.stock !== undefined ? String(p.stock) : "0",
          "",
          "yes",
        ])
      : [
          ["KCH-1001", "Belgian Chocolate Truffle", "750", "10", "699", "yes"],
          ["KCH-1002", "Fudge Brownie", "480", "24", "", "yes"],
        ];

    if (format === "xlsx") {
      import("./xlsx").then(({ exportToXlsx }) => {
        exportToXlsx(headers, rows, `kichees-products-update.xlsx`, "ProductUpdates");
      });
    } else {
      triggerDownload(toCsv(headers, rows), `kichees-products-update.csv`, "text/csv;charset=utf-8");
    }
  } else {
    const headers = ["SKU", "Material Name", "Stock Quantity", "Cost Per Unit", "Low Stock Alert"];
    const rows = (existingItems && existingItems.length > 0)
      ? existingItems.map((m) => [
          m.sku || "",
          m.name,
          m.stock !== undefined ? String(m.stock) : "0",
          m.costPerUnit !== undefined ? String(m.costPerUnit) : "0",
          "5",
        ])
      : [
          ["RAW-FLOUR-01", "Refined Wheat Flour (Maida)", "50", "48", "15"],
          ["RAW-CREAM-01", "Heavy Dairy Whipping Cream", "20", "220", "5"],
        ];

    if (format === "xlsx") {
      import("./xlsx").then(({ exportToXlsx }) => {
        exportToXlsx(headers, rows, `kichees-raw-materials-update.xlsx`, "MaterialUpdates");
      });
    } else {
      triggerDownload(toCsv(headers, rows), `kichees-raw-materials-update.csv`, "text/csv;charset=utf-8");
    }
  }
}

export function downloadInstructions(mode: "products" | "raw-materials"): void {
  triggerDownload(instructionsText(mode), `kichees-${mode}-how-to.txt`, "text/plain;charset=utf-8");
}

export function generateAndDownloadErrorReport(
  mode: "products" | "raw-materials",
  rows: { rowNumber: number; raw: Record<string, string>; issues: { field: string; message: string; severity: string }[] }[]
): void {
  const errorRows = rows.filter((r) => r.issues && r.issues.length > 0);
  if (errorRows.length === 0) return;

  // Collect all raw keys from the first row or across rows
  const rawKeys = Array.from(new Set(errorRows.flatMap((r) => Object.keys(r.raw))));
  const headers = ["Row #", "Errors & Warnings", ...rawKeys];

  const body = errorRows.map((r) => {
    const issuesSummary = r.issues.map((i) => `[${i.severity.toUpperCase()}] ${i.field}: ${i.message}`).join(" | ");
    const rowValues = rawKeys.map((k) => r.raw[k] ?? "");
    return [r.rowNumber, issuesSummary, ...rowValues];
  });

  const csv = toCsv(headers, body);
  triggerDownload(csv, `kichees-${mode}-error-report.csv`, "text/csv;charset=utf-8");
}

export function downloadErrorReport(
  mode: "products" | "raw-materials",
  csv: string
): void {
  const fileName = `kichees-${mode}-errors.csv`;
  triggerDownload(csv, fileName, "text/csv;charset=utf-8");
}

export function triggerDownload(content: string, fileName: string, mime: string): void {
  // The BOM makes Excel open UTF-8 CSVs without mangling accented names.
  const blob = new Blob([`\uFEFF${content}`], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Header labels -> machine keys, used to build the error report download. */
export const PRODUCT_HEADER_LABELS = PRODUCT_COLUMNS.map((c) => c.label);
export const RAW_HEADER_LABELS = RAW_MATERIAL_COLUMNS.map((c) => c.label);

