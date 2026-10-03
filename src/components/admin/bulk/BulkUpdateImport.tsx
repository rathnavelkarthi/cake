"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Package,
  RefreshCw,
  Search,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ActionBadge,
  Banner,
  ErrorReportButton,
  FieldDiffList,
  IssueList,
  ProgressNote,
  SectionCard,
  SourcePicker,
  SummaryBar,
} from "./shared";
import { parseClipboard } from "@/lib/bulk-import/csv";
import { readSpreadsheetFile } from "@/lib/bulk-import/xlsx";
import {
  parseProductSheet,
  parseRawMaterialSheet,
  summarise,
  type ParsedProduct,
  type ParsedRawMaterial,
  type ParsedRow,
  type ParseSheetResult,
} from "@/lib/bulk-import/schemas";
import { downloadUpdateTemplate, generateAndDownloadErrorReport } from "@/lib/bulk-import/template";
import {
  bulkUpdateProducts,
  bulkImportRawMaterials,
  getInventoryProducts,
  getRawMaterials,
  localRawMaterials,
  subscribeInventory,
  type AdminProductItem,
  type BulkImportOutcome,
} from "@/lib/db/admin-data";

type UpdateCategory = "products" | "raw-materials";
type Stage = "source" | "review" | "done";

export default function BulkUpdateImport() {
  const router = useRouter();
  const [updateCategory, setUpdateCategory] = useState<UpdateCategory>("products");
  const [stage, setStage] = useState<Stage>("source");
  const [sourceName, setSourceName] = useState("");
  const [existingProducts, setExistingProducts] = useState<AdminProductItem[]>([]);
  const [existingMaterials, setExistingMaterials] = useState<any[]>([]);

  const [productParsed, setProductParsed] = useState<ParseSheetResult<ParsedProduct> | null>(null);
  const [materialParsed, setMaterialParsed] = useState<ParseSheetResult<ParsedRawMaterial> | null>(null);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ label: "", current: 0, total: 0 });
  const [outcome, setOutcome] = useState<BulkImportOutcome | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "changes" | "issues">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setExistingProducts(getInventoryProducts());
    setExistingMaterials(localRawMaterials);
    return subscribeInventory(() => {
      setExistingProducts(getInventoryProducts());
      setExistingMaterials(localRawMaterials);
    });
  }, []);

  const productRows = useMemo(() => productParsed?.rows ?? [], [productParsed]);
  const materialRows = useMemo(() => materialParsed?.rows ?? [], [materialParsed]);
  const currentRows = updateCategory === "products" ? productRows : materialRows;
  const stats = useMemo(() => summarise(currentRows as any), [currentRows]);

  const filteredRows = useMemo(() => {
    let list = currentRows as ParsedRow<any>[];
    if (filterMode === "changes") {
      list = list.filter((r) => r.diffs && r.diffs.length > 0);
    } else if (filterMode === "issues") {
      list = list.filter((r) => r.issues && r.issues.length > 0);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.value?.name?.toLowerCase().includes(q) ||
          r.value?.sku?.toLowerCase().includes(q) ||
          r.existingLabel?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [currentRows, filterMode, searchQuery]);

  // Ingestion handler
  const handleSpreadsheet = useCallback(
    async (file: File) => {
      setBusy(true);
      setError(null);
      setSourceName(file.name);
      try {
        const { records } = await readSpreadsheetFile(file);
        if (records.length === 0) {
          setError("No data rows found in spreadsheet. Check that row 1 contains headers.");
          setBusy(false);
          return;
        }

        if (updateCategory === "products") {
          const res = parseProductSheet(records, {
            catalogue: localRawMaterials,
            existingProducts: getInventoryProducts().map((p) => ({
              id: String(p.id),
              name: p.name,
              sku: p.sku ?? null,
              slug: p.slug,
              price: p.price,
              salePrice: p.salePrice,
              stock: p.stock,
              lowStockThreshold: p.lowStockThreshold,
              category: p.category,
              description: p.description,
              isActive: p.status !== "inactive",
              isEggless: p.isEggless,
              isFeatured: p.featured,
              isBestSeller: p.bestSeller,
              imageUrl: p.imageUrl,
            })),
            autoCreateIngredients: false,
            mode: "update-only",
          });
          setProductParsed(res);
        } else {
          const res = parseRawMaterialSheet(records, {
            existingMaterials: localRawMaterials,
            mode: "update-only",
          });
          setMaterialParsed(res);
        }
        setStage("review");
      } catch (err) {
        console.error("Failed to parse update spreadsheet:", err);
        setError(err instanceof Error ? err.message : "Failed to read spreadsheet");
      } finally {
        setBusy(false);
      }
    },
    [updateCategory]
  );

  const handlePastedText = useCallback(
    (text: string) => {
      const rows = parseClipboard(text);
      if (rows.length < 2) {
        setError("Pasted text must include a header line and at least one data row.");
        return;
      }
      const rawHeaders = rows[0].map((h) =>
        h.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
      );
      const records = rows.slice(1).map((row) => {
        const rec: Record<string, string> = {};
        rawHeaders.forEach((h, i) => {
          rec[h] = row[i] ?? "";
        });
        return rec;
      });

      setSourceName("Pasted text");
      if (updateCategory === "products") {
        const res = parseProductSheet(records, {
          catalogue: localRawMaterials,
          existingProducts: getInventoryProducts().map((p) => ({
            id: String(p.id),
            name: p.name,
            sku: p.sku ?? null,
            slug: p.slug,
            price: p.price,
            salePrice: p.salePrice,
            stock: p.stock,
            lowStockThreshold: p.lowStockThreshold,
            category: p.category,
            description: p.description,
            isActive: p.status !== "inactive",
            isEggless: p.isEggless,
            isFeatured: p.featured,
            isBestSeller: p.bestSeller,
            imageUrl: p.imageUrl,
          })),
          autoCreateIngredients: false,
          mode: "update-only",
        });
        setProductParsed(res);
      } else {
        const res = parseRawMaterialSheet(records, {
          existingMaterials: localRawMaterials,
          mode: "update-only",
        });
        setMaterialParsed(res);
      }
      setStage("review");
    },
    [updateCategory]
  );

  // Execute update
  const handleConfirmUpdate = async () => {
    setBusy(true);
    setError(null);
    setProgress({ label: "Applying updates...", current: 1, total: 2 });
    try {
      if (updateCategory === "products") {
        const validRows = productRows.filter((r) => r.value && r.action === "update");
        if (validRows.length === 0) {
          throw new Error("No valid matched products to update in this file.");
        }
        const items = validRows.map((r) => ({
          sku: r.value!.sku,
          name: r.value!.name,
          price: r.value!.price,
          salePrice: r.value!.salePrice,
          stock: r.value!.stock,
          lowStockThreshold: r.value!.lowStockThreshold,
          category: r.value!.category,
          description: r.value!.description,
          isActive: r.value!.isActive,
          isEggless: r.value!.isEggless,
          isFeatured: r.value!.isFeatured,
          isBestSeller: r.value!.isBestSeller,
          imageUrl: r.value!.image,
          productType: r.value!.productType,
        }));

        const res = await bulkUpdateProducts(items, sourceName);
        setOutcome(res);
      } else {
        const validRows = materialRows.filter((r) => r.value && r.action === "update");
        if (validRows.length === 0) {
          throw new Error("No valid matched raw materials to update in this file.");
        }
        const items = validRows.map((r) => ({
          name: r.value!.name,
          sku: r.value!.sku,
          category: r.value!.category,
          stock: r.value!.stock,
          unit: r.value!.unit,
          minThreshold: r.value!.minThreshold,
          costPerUnit: r.value!.costPerUnit,
          supplier: r.value!.supplier,
        }));
        const res = await bulkImportRawMaterials(items);
        setOutcome(res);
      }
      setProgress({ label: "Complete", current: 2, total: 2 });
      setStage("done");
    } catch (err) {
      console.error("Bulk update failed:", err);
      setError(err instanceof Error ? err.message : "Failed to execute updates");
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadInventoryTemplate = (format: "csv" | "xlsx") => {
    if (updateCategory === "products") {
      const items = existingProducts.map((p) => ({
        sku: p.sku || "",
        name: p.name,
        price: p.price,
        stock: p.stock,
      }));
      downloadUpdateTemplate("products", items, format);
    } else {
      const items = existingMaterials.map((m) => ({
        sku: m.sku || "",
        name: m.name,
        stock: m.stock,
        costPerUnit: m.costPerUnit,
        unit: m.unit,
      }));
      downloadUpdateTemplate("raw-materials", items, format);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={updateCategory === "products" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setUpdateCategory("products");
              setStage("source");
              setProductParsed(null);
            }}
            className={updateCategory === "products" ? "bg-amber-900 text-white hover:bg-amber-950" : ""}
          >
            Update Products (Prices & Stocks)
          </Button>
          <Button
            type="button"
            variant={updateCategory === "raw-materials" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setUpdateCategory("raw-materials");
              setStage("source");
              setMaterialParsed(null);
            }}
            className={updateCategory === "raw-materials" ? "bg-amber-900 text-white hover:bg-amber-950" : ""}
          >
            Update Raw Materials (Inventory & Costs)
          </Button>
        </div>

        {stage === "source" && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDownloadInventoryTemplate("xlsx")}
              className="gap-1.5 border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:bg-stone-50"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
              Download current sheet (Excel)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDownloadInventoryTemplate("csv")}
              className="gap-1.5 border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:bg-stone-50"
            >
              <Download className="h-3.5 w-3.5 text-stone-600" />
              CSV format
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Banner tone="error" title="Error" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}

      {/* Stage: Source */}
      {stage === "source" && (
        <SectionCard
          title={`Bulk Update ${updateCategory === "products" ? "Products" : "Raw Materials"}`}
          description="Upload an Excel (.xlsx) or CSV file with your changes. Only provided fields will be updated; unspecified columns remain untouched."
          icon={<RefreshCw className="h-5 w-5 text-amber-800" />}
        >
          <SourcePicker
            onFile={handleSpreadsheet}
            onPaste={handlePastedText}
            disabled={busy}
            acceptedNote="Supports Excel (.xlsx, .xls) and CSV (.csv, .tsv, .txt). Items are matched by SKU, Slug or Name."
          />
        </SectionCard>
      )}

      {/* Stage: Review */}
      {stage === "review" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4">
            <div>
              <p className="text-sm font-bold text-stone-900">
                Reviewing changes from: <span className="font-mono text-amber-900">{sourceName}</span>
              </p>
              <p className="text-xs text-stone-500">
                Found {stats.total} row{stats.total === 1 ? "" : "s"} ({stats.update} update{stats.update === 1 ? "" : "s"}, {stats.skip} skipped)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStage("source")}
                disabled={busy}
              >
                Change file
              </Button>
              <ErrorReportButton
                onDownload={() =>
                  generateAndDownloadErrorReport(updateCategory, currentRows as any)
                }
                errorCount={stats.errors}
                warningCount={stats.warnings}
              />
              <Button
                type="button"
                onClick={handleConfirmUpdate}
                disabled={busy || stats.update === 0}
                className="gap-2 bg-amber-900 font-semibold text-white hover:bg-amber-950"
              >
                Apply {stats.update} update{stats.update === 1 ? "" : "s"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <SummaryBar
            create={stats.create}
            update={stats.update}
            skip={stats.skip}
            warnings={stats.warnings}
            errors={stats.errors}
          />

          {busy && (
            <ProgressNote
              label={progress.label}
              current={progress.current}
              total={progress.total}
            />
          )}

          {/* Filtering and search toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={filterMode === "all" ? "default" : "outline"}
                onClick={() => setFilterMode("all")}
                className="h-8 text-xs"
              >
                All rows ({currentRows.length})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={filterMode === "changes" ? "default" : "outline"}
                onClick={() => setFilterMode("changes")}
                className="h-8 text-xs"
              >
                With changes ({(currentRows as any[]).filter((r) => r.diffs && r.diffs.length > 0).length})
              </Button>
              {stats.warnings + stats.errors > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant={filterMode === "issues" ? "destructive" : "outline"}
                  onClick={() => setFilterMode("issues")}
                  className="h-8 text-xs"
                >
                  Issues only ({stats.errors + stats.warnings})
                </Button>
              )}
            </div>

            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Filter by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-lg border border-stone-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-amber-700"
              />
            </div>
          </div>

          {/* Preview table with FieldDiffList */}
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-stone-50">
                  <TableHead className="w-16">Row</TableHead>
                  <TableHead className="w-24">Action</TableHead>
                  <TableHead className="w-28">SKU</TableHead>
                  <TableHead className="min-w-[180px]">Item</TableHead>
                  <TableHead className="min-w-[280px]">Field Changes</TableHead>
                  <TableHead className="min-w-[200px]">Validation Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row, idx) => (
                  <TableRow
                    key={row.rowNumber || idx}
                    className={row.action === "skip" ? "bg-stone-50/50" : undefined}
                  >
                    <TableCell className="font-mono text-xs text-stone-500">
                      {row.rowNumber}
                    </TableCell>
                    <TableCell>
                      <ActionBadge action={row.action} />
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-stone-700">
                      {row.value?.sku || (row.raw as any)?.sku || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-bold text-stone-900">
                        {row.value?.name || row.existingLabel || "Unnamed item"}
                      </div>
                      {row.existingLabel && row.existingLabel !== row.value?.name && (
                        <div className="text-[10px] text-stone-400">
                          Matches: {row.existingLabel}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.diffs && row.diffs.length > 0 ? (
                        <FieldDiffList diffs={row.diffs} />
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">No values modified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <IssueList issues={row.issues} />
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-xs text-stone-500">
                      No rows match the selected filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Stage: Done */}
      {stage === "done" && outcome && (
        <div className="space-y-6">
          <Banner
            tone="success"
            title="Bulk Update Completed Successfully!"
          >
            Successfully updated {outcome.summary.updated} item{outcome.summary.updated === 1 ? "" : "s"} in your catalog.
            {outcome.summary.skipped > 0 && ` ${outcome.summary.skipped} rows were skipped.`}
          </Banner>

          <SummaryBar
            create={0}
            update={outcome.summary.updated}
            skip={outcome.summary.skipped}
            warnings={0}
            errors={0}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => {
                setStage("source");
                setProductParsed(null);
                setMaterialParsed(null);
                setOutcome(null);
              }}
              className="bg-amber-900 text-white hover:bg-amber-950"
            >
              Update another sheet
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/inventory")}
            >
              View updated inventory
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
