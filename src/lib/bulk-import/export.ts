/**
 * Export utilities for downloading the full Products and Raw Materials catalogues
 * as formatted Excel (.xlsx) or CSV files directly in the browser.
 */

import { toCsv } from "./csv";
import { exportToXlsx } from "./xlsx";
import type { AdminProductItem, RawMaterialItem } from "@/lib/db/admin-data";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Exports all products to an Excel (.xlsx) or CSV file.
 */
export function exportProducts(
  products: AdminProductItem[],
  format: "xlsx" | "csv" = "xlsx"
): void {
  const headers = [
    "Product Name",
    "SKU",
    "Category",
    "Selling Price (INR)",
    "Sale Price (INR)",
    "Stock Quantity",
    "Low Stock Alert Threshold",
    "Dietary (Veg/Non-Veg)",
    "Status (Active/Inactive)",
    "Best Seller",
    "Featured",
    "Image URL",
    "Outlet / Kitchen",
    "Description",
    "Recipe / Ingredients",
  ];

  const rows = products.map((p) => {
    const recipeString = (p.recipe ?? [])
      .map((r) => `${r.rawMaterialName} ${r.amount}${r.unit}`)
      .join("; ");

    return [
      p.name,
      p.sku,
      p.category,
      p.price,
      p.salePrice ?? "",
      p.stock,
      p.lowStockThreshold ?? 5,
      p.isEggless !== false ? "Vegetarian (100% Eggless)" : "Non-Vegetarian (Contains Egg)",
      p.status === "active" ? "Active" : "Inactive",
      p.bestSeller ? "Yes" : "No",
      p.featured ? "Yes" : "No",
      p.imageUrl || "",
      p.availableBranches || "Casablanca Studio",
      p.description || "",
      recipeString,
    ];
  });

  const filename = `kichees-products-catalogue-${getTodayString()}`;

  if (format === "xlsx") {
    exportToXlsx(headers, rows, `${filename}.xlsx`, "Products Catalogue");
  } else {
    const csvContent = toCsv(headers, rows);
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, `${filename}.csv`);
  }
}

/**
 * Exports all raw materials to an Excel (.xlsx) or CSV file.
 */
export function exportRawMaterials(
  materials: RawMaterialItem[],
  format: "xlsx" | "csv" = "xlsx"
): void {
  const headers = [
    "Material Name",
    "SKU",
    "Category",
    "Current Stock",
    "Unit",
    "Minimum Threshold",
    "Cost Per Unit (INR)",
    "Supplier",
  ];

  const rows = materials.map((m) => [
    m.name,
    m.sku,
    m.category,
    m.stock,
    m.unit,
    m.minThreshold,
    m.costPerUnit,
    m.supplier || "",
  ]);

  const filename = `kichees-raw-materials-catalogue-${getTodayString()}`;

  if (format === "xlsx") {
    exportToXlsx(headers, rows, `${filename}.xlsx`, "Raw Materials");
  } else {
    const csvContent = toCsv(headers, rows);
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, `${filename}.csv`);
  }
}
