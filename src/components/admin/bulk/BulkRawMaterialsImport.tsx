"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, RefreshCw, Upload } from "lucide-react";
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
  TemplateBar,
} from "./shared";
import { parseClipboard, parseDelimited, toRecords } from "@/lib/bulk-import/csv";
import { readSpreadsheetFile } from "@/lib/bulk-import/xlsx";
import {
  parseRawMaterialSheet,
  summarise,
  type ParsedRow,
  type ParsedRawMaterial,
  type ParseSheetResult,
} from "@/lib/bulk-import/schemas";
import { downloadInstructions, downloadTemplate, generateAndDownloadErrorReport } from "@/lib/bulk-import/template";
import { SEED_RAW_MATERIALS } from "@/data/seed-raw-materials-template";
import {
  bulkImportRawMaterials,
  localRawMaterials,
  subscribeInventory,
  type BulkImportOutcome,
  type RawMaterialItem,
} from "@/lib/db/admin-data";

type Stage = "source" | "review" | "done";

export default function BulkRawMaterialsImport() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("source");
  const [catalogue, setCatalogue] = useState<RawMaterialItem[]>([...localRawMaterials]);
  const [parsed, setParsed] = useState<ParseSheetResult<ParsedRawMaterial> | null>(null);
  const [sourceName, setSourceName] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [outcome, setOutcome] = useState<BulkImportOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeInventory(() => setCatalogue([...localRawMaterials]));
  }, []);

  // Wrapped in useMemo so the derived counts below are not recomputed each render.
  const rows = useMemo(() => parsed?.rows ?? [], [parsed]);
  const stats = useMemo(() => summarise(rows), [rows]);
  const importable = useMemo(
    () => rows.filter((r) => r.value && r.action !== "skip"),
    [rows]
  );

  const handleText = (text: string, sourceName: string) => {
    const { rows: matrix } = sourceName === "pasted"
      ? { rows: parseClipboard(text) }
      : parseDelimited(text);

    if (matrix.length === 0) {
      setError("That file looks empty. Check it has a header row and at least one item.");
      return;
    }
    if (matrix.length === 1) {
      setError(
        "Only a header row was found. Add at least one item under it, then upload again."
      );
      return;
    }

    const { records } = toRecords(matrix);
    setError(null);
    setSourceName(sourceName);
    setParsed(parseRawMaterialSheet(records, { existingMaterials: catalogue }));
    setStage("review");
  };

  const handleFile = async (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      setError("That file is over 25MB. Split it into smaller files and upload again.");
      return;
    }
    try {
      const { records } = await readSpreadsheetFile(file);
      if (records.length === 0) {
        setError("No data rows found in spreadsheet. Check that row 1 contains headers.");
        return;
      }
      setError(null);
      setSourceName(file.name);
      setParsed(parseRawMaterialSheet(records, { existingMaterials: catalogue }));
      setStage("review");
    } catch (err) {
      console.error("Error parsing raw material spreadsheet:", err);
      setError("Could not parse file. Please verify it is a valid Excel or CSV file.");
    }
  };

  const handleLoadSeedRawMaterials = () => {
    const records = SEED_RAW_MATERIALS.map((m) => ({
      name: m.name,
      sku: m.sku,
      category: m.category,
      stock: String(m.stock),
      unit: m.unit,
      min_threshold: String(m.minThreshold),
      cost_per_unit: String(m.costPerUnit),
      supplier: m.supplier,
    }));

    setError(null);
    setSourceName("Master Raw Materials Catalogue (40+ Bakery & Kitchen Items)");
    setParsed(parseRawMaterialSheet(records, { existingMaterials: catalogue }));
    setStage("review");
  };

  const handleImport = async () => {
    if (importable.length === 0) return;
    setImporting(true);
    setError(null);
    setProgress({ current: 0, total: importable.length });

    try {
      const result = await bulkImportRawMaterials(
        importable.map((row: ParsedRow<ParsedRawMaterial>) => ({
          name: row.value!.name,
          sku: row.value!.sku,
          category: row.value!.category,
          stock: row.value!.stock,
          unit: row.value!.unit,
          minThreshold: row.value!.minThreshold,
          costPerUnit: row.value!.costPerUnit,
          supplier: row.value!.supplier,
        }))
      );
      setOutcome(result);
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed. Nothing was changed.");
    } finally {
      setImporting(false);
    }
  };

  const startOver = () => {
    setStage("source");
    setParsed(null);
    setOutcome(null);
    setError(null);
    setSourceName("");
  };

  /* ---------------------------------------------------------------------- */
  /* Done                                                                    */
  /* ---------------------------------------------------------------------- */

  if (stage === "done" && outcome) {
    const failed = outcome.results.filter((r) => r.action === "skipped");
    return (
      <div className="space-y-4">
        <Banner tone="success" title="Raw materials updated">
          {outcome.summary.created} added, {outcome.summary.updated} updated
          {outcome.summary.skipped > 0 ? `, ${outcome.summary.skipped} skipped` : ""}.
          The Raw Materials tab on the Inventory page now shows the full list.
        </Banner>

        {failed.length > 0 && (
          <SectionCard title="Rows that could not be saved" icon={<Upload className="h-4 w-4 text-red-700" />}>
            <ul className="space-y-1">
              {failed.map((row) => (
                <li key={row.index} className="text-[11px] text-red-800">
                  <span className="font-semibold">Row {row.index + 2}</span> ({row.name || "no name"})
                  : {row.error}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        <div className="flex gap-2">
          <Button onClick={startOver} className="bg-amber-900 text-xs text-white hover:bg-amber-950">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload another file
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/inventory")} className="text-xs">
            Go to Inventory
          </Button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Review                                                                  */
  /* ---------------------------------------------------------------------- */

  if (stage === "review" && parsed) {
    return (
      <div className="space-y-4">
        {error && <Banner tone="error" title="Import failed" onDismiss={() => setError(null)}>{error}</Banner>}

        <SummaryBar
          create={stats.create}
          update={stats.update}
          skip={stats.skip}
          warnings={stats.warnings}
          errors={stats.errors}
        />

        {parsed.problems.map((problem) => (
          <Banner key={problem.message} tone="info" title={problem.message} />
        ))}

        {parsed.unknownHeaders.length > 0 && (
          <Banner tone="info" title="Columns we did not recognise">
            {parsed.unknownHeaders.join(", ")} {parsed.unknownHeaders.length === 1 ? "was" : "were"}{" "}
            ignored. Everything else in the file was still used.
          </Banner>
        )}

        <SectionCard
          title={`Review ${rows.length} row${rows.length === 1 ? "" : "s"} from ${sourceName}`}
          description="Rows marked Skipped will not be saved. Fix them in your file and upload again, or just import the rest."
          icon={<Package className="h-4 w-4 text-amber-800" />}
        >
          <div className="max-h-[28rem] overflow-auto rounded-xl border border-stone-200">
            <Table>
              <TableHeader className="sticky top-0 bg-stone-50">
                <TableRow>
                  <TableHead className="w-14 text-[10px]">Row</TableHead>
                  <TableHead className="text-[10px]">Material</TableHead>
                  <TableHead className="text-[10px]">Category</TableHead>
                  <TableHead className="text-[10px]">Opening Stock</TableHead>
                  <TableHead className="text-[10px]">Alert At</TableHead>
                  <TableHead className="text-[10px]">Cost</TableHead>
                  <TableHead className="text-[10px]">Action</TableHead>
                  <TableHead className="text-[10px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.rowNumber}
                    className={row.action === "skip" ? "bg-red-50/40" : undefined}
                  >
                    <TableCell className="text-[10px] tabular-nums text-stone-400">
                      {row.rowNumber}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-stone-900">
                      {row.value?.name || <span className="text-red-600">—</span>}
                      {row.existingLabel && (
                        <span className="block text-[10px] font-normal text-stone-400">
                          matches “{row.existingLabel}”
                        </span>
                      )}
                      {row.diffs && row.diffs.length > 0 && (
                        <FieldDiffList diffs={row.diffs} className="mt-1" />
                      )}
                    </TableCell>
                    <TableCell className="text-[11px] text-stone-600">
                      {row.value?.category}
                    </TableCell>
                    <TableCell className="text-[11px] tabular-nums text-stone-700">
                      {row.value ? `${row.value.stock} ${row.value.unit}` : "—"}
                    </TableCell>
                    <TableCell className="text-[11px] tabular-nums text-stone-500">
                      {row.value?.minThreshold}
                    </TableCell>
                    <TableCell className="text-[11px] tabular-nums text-stone-500">
                      {row.value ? `₹${row.value.costPerUnit}` : "—"}
                    </TableCell>
                    <TableCell>
                      <ActionBadge action={row.action} />
                    </TableCell>
                    <TableCell className="max-w-[16rem]">
                      <IssueList issues={row.issues} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {importing && (
            <ProgressNote
              label="Saving raw materials"
              current={progress.current}
              total={progress.total}
            />
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleImport}
              disabled={importing || importable.length === 0}
              className="bg-amber-900 text-xs font-semibold text-white hover:bg-amber-950"
            >
              {importing ? (
                <>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Import {importable.length} material{importable.length === 1 ? "" : "s"}
                </>
              )}
            </Button>
            <ErrorReportButton
              onDownload={() => generateAndDownloadErrorReport("raw-materials", rows)}
              errorCount={stats.errors}
              warningCount={stats.warnings}
            />
            <Button variant="outline" onClick={startOver} disabled={importing} className="text-xs">
              Start over
            </Button>
            {stats.skip > 0 && (
              <span className="text-[11px] text-stone-500">
                {stats.skip} row{stats.skip === 1 ? "" : "s"} will be skipped because of errors.
              </span>
            )}
          </div>
        </SectionCard>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Source                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-4">
      {error && <Banner tone="error" title="Could not read that" onDismiss={() => setError(null)}>{error}</Banner>}

      <TemplateBar
        onTemplate={() => downloadTemplate("raw-materials")}
        onInstructions={() => downloadInstructions("raw-materials")}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-4">
        <div>
          <h3 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
            <span>✨</span>
            Preloaded Master Raw Materials Catalogue (40+ Bakery & Kitchen Items)
          </h3>
          <p className="mt-0.5 text-xs text-amber-900/80">
            Load flours, Callebaut chocolates, sugars, dairy, yeasts, vanilla extracts, meats, produce and oils ready to stock your kitchen inventory.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleLoadSeedRawMaterials}
          className="bg-amber-900 text-xs font-semibold text-white hover:bg-amber-950 shadow-xs"
        >
          Load 40+ Raw Materials
        </Button>
      </div>

      <SectionCard
        title="Upload your raw materials"
        description="Flour, sugar, chocolate, cream, packaging - anything the kitchen buys and uses."
        icon={<Package className="h-4 w-4 text-amber-800" />}
      >
        <SourcePicker
          onFile={handleFile}
          onPaste={(text) => handleText(text, "pasted rows")}
          acceptedNote="CSV exported from Excel or Google Sheets. Nothing leaves your browser until you confirm."
        />
      </SectionCard>
    </div>
  );
}
