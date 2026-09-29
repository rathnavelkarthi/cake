"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Images,
  RefreshCw,
  Upload,
  X,
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
  CheckOption,
  IssueList,
  ProgressNote,
  SectionCard,
  SourcePicker,
  SummaryBar,
  TemplateBar,
} from "./shared";
import { parseClipboard, parseDelimited, toRecords } from "@/lib/bulk-import/csv";
import {
  parseProductSheet,
  summarise,
  type ParsedProduct,
  type ParsedRow,
  type ParseSheetResult,
} from "@/lib/bulk-import/schemas";
import { downloadInstructions, downloadTemplate } from "@/lib/bulk-import/template";
import { IMAGE_ACCEPT, matchImages, type ImageMatch } from "@/lib/bulk-import/image-match";
import {
  bulkImportProducts,
  getInventoryProducts,
  localRawMaterials,
  subscribeInventory,
  updateInventoryProduct,
  uploadImage,
  type AdminProductItem,
  type BulkImportOutcome,
} from "@/lib/db/admin-data";

type Stage = "source" | "review" | "done";

export default function BulkProductsImport() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("source");
  const [parsed, setParsed] = useState<ParseSheetResult<ParsedProduct> | null>(null);
  const [sourceName, setSourceName] = useState("");
  /** Snapshot of existing products, for matching photos onto updated rows. */
  const [existing, setExisting] = useState<AdminProductItem[]>([]);
  const [autoCreateIngredients, setAutoCreateIngredients] = useState(true);

  const [files, setFiles] = useState<File[]>([]);
  const [matches, setMatches] = useState<ImageMatch[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  /** Kept so toggling an import option can re-validate without re-reading the file. */
  const [sourceRecords, setSourceRecords] = useState<Record<string, string>[]>([]);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ label: "", current: 0, total: 0 });
  const [outcome, setOutcome] = useState<BulkImportOutcome | null>(null);
  const [photoNotes, setPhotoNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeInventory(() => setExisting(getInventoryProducts()));
  }, []);

  // Wrapped in useMemo so the derived counts below are not recomputed each render.
  const rows = useMemo(() => parsed?.rows ?? [], [parsed]);
  const stats = useMemo(() => summarise(rows), [rows]);
  const importable = useMemo(
    () => rows.filter((r) => r.value && r.action !== "skip"),
    [rows]
  );

  /**
   * Runs the sheet through validation. Called on ingest and again whenever an
   * import option changes, so the warnings always describe what will happen.
   */
  const runValidation = useCallback(
    (records: Record<string, string>[], autoCreate: boolean) =>
      parseProductSheet(records, {
        catalogue: localRawMaterials,
        existingProducts: getInventoryProducts().map((p) => ({
          id: String(p.id),
          name: p.name,
          sku: p.sku,
          slug: p.slug,
        })),
        autoCreateIngredients: autoCreate,
      }),
    []
  );

  const matchedCount = matches.filter((m) => m.file).length;
  const unusedFiles = useMemo(() => {
    const used = new Set(matches.filter((m) => m.file).map((m) => m.file!.name));
    return files.filter((f) => !used.has(f.name));
  }, [files, matches]);

  /* ---------------------------------------------------------------------- */
  /* Ingest                                                                  */
  /* ---------------------------------------------------------------------- */

  const handleText = (text: string, name: string) => {
    const { rows: matrix } = name === "pasted" ? { rows: parseClipboard(text) } : parseDelimited(text);

    if (matrix.length === 0) {
      setError("That file looks empty. Check it has a header row and at least one product.");
      return;
    }
    if (matrix.length === 1) {
      setError(
        "Only a header row was found. Add at least one product under it, then upload again."
      );
      return;
    }

    const { records } = toRecords(matrix);
    setError(null);
    setSourceName(name);
    setSourceRecords(records);
    setParsed(runValidation(records, autoCreateIngredients));
    setFiles([]);
    setMatches([]);
    setStage("review");
  };

  const handleFile = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      setError("That file is over 8MB. Split it into smaller files and upload again.");
      return;
    }
    handleText(await file.text(), file.name);
  };

  /* ---------------------------------------------------------------------- */
  /* Photos                                                                  */
  /* ---------------------------------------------------------------------- */

  const recomputeMatches = (nextFiles: File[], targetRows: ParsedRow<ParsedProduct>[]) => {
    const targets = targetRows
      .filter((r) => r.value)
      .map((r) => ({
        index: r.rowNumber,
        name: r.value!.name,
        slug: r.value!.slug,
        sku: r.value!.sku,
        imageHint: r.value!.image,
      }));
    setMatches(matchImages(nextFiles, targets).matches);
  };

  const handleFiles = (list: FileList | null) => {
    if (!list || !parsed) return;
    const images = Array.from(list).filter((file) => file.type.startsWith("image/"));
    const rejected = Array.from(list).length - images.length;
    if (rejected > 0) {
      setError(`${rejected} file${rejected === 1 ? " was" : "s were"} skipped because they are not images.`);
    } else {
      setError(null);
    }
    const next = [...files, ...images];
    setFiles(next);
    recomputeMatches(next, parsed.rows);
  };

  const removeFile = (name: string) => {
    const next = files.filter((f) => f.name !== name);
    setFiles(next);
    if (parsed) recomputeMatches(next, parsed.rows);
  };

  /* ---------------------------------------------------------------------- */
  /* Import                                                                  */
  /* ---------------------------------------------------------------------- */

  const handleImport = async () => {
    if (importable.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    setPhotoNotes([]);

    try {
      // 1. Upload photos first so each row can carry its final image URL.
      const urlByRow = new Map<number, string>();
      const paired = matches.filter((m) => m.file);
      if (paired.length > 0) {
        setProgress({ label: "Uploading photos", current: 0, total: paired.length });
        for (let i = 0; i < paired.length; i += 1) {
          const match = paired[i];
          const url = await uploadImage(match.file!);
          setProgress({ label: "Uploading photos", current: i + 1, total: paired.length });
          if (url) urlByRow.set(match.target.index, url);
          else setPhotoNotes((notes) => [...notes, `Photo not uploaded: ${match.file!.name}`]);
        }
      }

      // 2. Write every row in one request.
      setProgress({ label: "Saving products", current: 0, total: importable.length });
      const result = await bulkImportProducts(
        importable.map((row: ParsedRow<ParsedProduct>) => ({
          name: row.value!.name,
          slug: row.value!.slug,
          sku: row.value!.sku,
          category: row.value!.category,
          price: row.value!.price,
          salePrice: row.value!.salePrice,
          stock: row.value!.stock,
          lowStockThreshold: row.value!.lowStockThreshold,
          description: row.value!.description,
          isEggless: row.value!.isEggless,
          isActive: row.value!.isActive,
          isFeatured: row.value!.isFeatured,
          isBestSeller: row.value!.isBestSeller,
          imageUrl: urlByRow.get(row.rowNumber),
          availableBranches: row.value!.availableBranches,
          branchIds: row.value!.branchIds,
          recipe: row.value!.recipe,
        }))
      );
      setProgress({ label: "Saving products", current: importable.length, total: importable.length });

      // 3. Rows that failed validation still deserve their photo if we matched one.
      const skippedRows = rows.filter((r) => !r.value && r.action === "skip");
      let rescued = 0;
      for (const row of skippedRows) {
        const url = urlByRow.get(row.rowNumber);
        const existingProduct = existing.find(
          (p) => normalise(p.name) === normalise(row.raw.name ?? "")
        );
        if (url && existingProduct) {
          updateInventoryProduct(existingProduct.id, { imageUrl: url });
          rescued += 1;
        }
      }
      if (rescued > 0) {
        setPhotoNotes((notes) => [
          ...notes,
          `${rescued} skipped row${rescued === 1 ? "" : "s"} still received the matched photo.`,
        ]);
      }

      setOutcome(result);
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed. Nothing was changed.");
    } finally {
      setBusy(false);
    }
  };

  const startOver = () => {
    setStage("source");
    setParsed(null);
    setOutcome(null);
    setError(null);
    setFiles([]);
    setMatches([]);
    setPhotoNotes([]);
    setSourceName("");
    setSourceRecords([]);
  };

  function normalise(value: string) {
    return value.toLowerCase().trim();
  }

  const fileByRow = useMemo(() => {
    const map = new Map<number, ImageMatch>();
    for (const match of matches) map.set(match.target.index, match);
    return map;
  }, [matches]);

  /* ---------------------------------------------------------------------- */
  /* Done                                                                    */
  /* ---------------------------------------------------------------------- */

  if (stage === "done" && outcome) {
    const failed = outcome.results.filter((r) => r.action === "skipped");
    return (
      <div className="space-y-4">
        <Banner tone="success" title="Products updated">
          {outcome.summary.created} added, {outcome.summary.updated} updated
          {outcome.summary.skipped > 0 ? `, ${outcome.summary.skipped} skipped` : ""}.
          {matchedCount > 0 && ` ${matchedCount} photo${matchedCount === 1 ? "" : "s"} attached.`}
        </Banner>

        {failed.length > 0 && (
          <SectionCard title="Rows that could not be saved" icon={<AlertTriangle className="h-4 w-4 text-red-700" />}>
            <ul className="space-y-1">
              {failed.map((row) => (
                <li key={row.index} className="text-[11px] text-red-800">
                  <span className="font-semibold">Row {row.index + 2}</span> ({row.name || "no name"}):{" "}
                  {row.error}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {photoNotes.length > 0 && (
          <Banner tone="info" title="About the photos">
            <ul className="list-inside list-disc space-y-0.5">
              {photoNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </Banner>
        )}

        {unusedFiles.length > 0 && (
          <Banner tone="info" title={`${unusedFiles.length} photo${unusedFiles.length === 1 ? "" : "s"} did not match any product`}>
            These were not attached to anything: {unusedFiles.map((f) => f.name).join(", ")}. Check
            for typos, or add them one at a time from the Products page.
          </Banner>
        )}

        <div className="flex gap-2">
          <Button onClick={startOver} className="bg-amber-900 text-xs text-white hover:bg-amber-950">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload another file
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/products")} className="text-xs">
            Go to Products
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
        {error && <Banner tone="error" title="Something went wrong" onDismiss={() => setError(null)}>{error}</Banner>}

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

        {/* Photos ---------------------------------------------------------- */}
        <SectionCard
          title="Product photos (optional)"
          description="Select as many images as you like. We match them to products by filename, so name them after the product."
          icon={<Images className="h-4 w-4 text-amber-800" />}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              disabled={busy}
              className="h-8 gap-1.5 border-stone-300 bg-white text-[11px] font-semibold"
            >
              <Camera className="h-3.5 w-3.5" />
              Choose photos
            </Button>
          }
        >
          <input
            ref={imageInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {files.length === 0 ? (
            <p className="rounded-lg border border-dashed border-stone-300 bg-stone-50/60 p-4 text-center text-[11px] text-stone-500">
              No photos selected. Products without a photo use the standard bakery image and you
              can add the real one later from the Products page.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-stone-600">
                <span className="font-semibold">{matchedCount} of {files.length}</span> matched to a
                product.
              </p>
              <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
                {files.map((file) => {
                  const used = matches.some((m) => m.file?.name === file.name);
                  return (
                    <span
                      key={file.name}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${
                        used
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {file.name}
                      <button
                        type="button"
                        onClick={() => removeFile(file.name)}
                        disabled={busy}
                        className="opacity-50 hover:opacity-100"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Import options -------------------------------------------------- */}
        <SectionCard title="Import options">
          <CheckOption
            checked={autoCreateIngredients}
            onChange={(next) => {
              setAutoCreateIngredients(next);
              setParsed(runValidation(sourceRecords, next));
            }}
            label="Create unknown ingredients as raw materials"
            hint="If a recipe mentions an ingredient that is not in your list yet, add it automatically so the recipe maths works. Turn this off to import only matching ingredients."
          />
        </SectionCard>

        {/* Row table ------------------------------------------------------- */}
        <SectionCard
          title={`Review ${rows.length} product${rows.length === 1 ? "" : "s"} from ${sourceName}`}
          description="Rows marked Skipped will not be saved. Everything else is applied when you confirm."
          icon={<CheckCircle2 className="h-4 w-4 text-amber-800" />}
        >
          <div className="max-h-[30rem] overflow-auto rounded-xl border border-stone-200">
            <Table>
              <TableHeader className="sticky top-0 bg-stone-50">
                <TableRow>
                  <TableHead className="w-14 text-[10px]">Row</TableHead>
                  <TableHead className="text-[10px]">Product</TableHead>
                  <TableHead className="text-[10px]">Category</TableHead>
                  <TableHead className="text-[10px]">Price</TableHead>
                  <TableHead className="text-[10px]">Stock</TableHead>
                  <TableHead className="text-[10px]">Recipe</TableHead>
                  <TableHead className="text-[10px]">Photo</TableHead>
                  <TableHead className="text-[10px]">Action</TableHead>
                  <TableHead className="text-[10px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const match = fileByRow.get(row.rowNumber);
                  return (
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
                      </TableCell>
                      <TableCell className="text-[11px] text-stone-600">
                        {row.value?.category}
                      </TableCell>
                      <TableCell className="text-[11px] tabular-nums text-stone-700">
                        {row.value ? (
                          <>
                            ₹{row.value.price}
                            {row.value.salePrice && (
                              <span className="block text-[10px] text-emerald-700">
                                ₹{row.value.salePrice}
                              </span>
                            )}
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-[11px] tabular-nums text-stone-700">
                        {row.value?.stock ?? "—"}
                      </TableCell>
                      <TableCell className="text-[10px] text-stone-600">
                        {row.value && row.value.recipe.length > 0 ? (
                          <>
                            {row.value.recipe.length} ingredient
                            {row.value.recipe.length === 1 ? "" : "s"}
                            {row.unknownIngredients.length > 0 && (
                              <span className="block text-amber-700">
                                +{row.unknownIngredients.length} new
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[10px]">
                        {match?.file ? (
                          <span className="text-emerald-700" title={match.file.name}>
                            {match.file.name.length > 18
                              ? `${match.file.name.slice(0, 16)}…`
                              : match.file.name}
                          </span>
                        ) : (
                          <span className="text-stone-400">default</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ActionBadge action={row.action} />
                      </TableCell>
                      <TableCell className="max-w-[18rem]">
                        <IssueList issues={row.issues} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {busy && (
            <ProgressNote label={progress.label} current={progress.current} total={progress.total} />
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleImport}
              disabled={busy || importable.length === 0}
              className="bg-amber-900 text-xs font-semibold text-white hover:bg-amber-950"
            >
              {busy ? (
                <>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Working…
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Import {importable.length} product{importable.length === 1 ? "" : "s"}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={startOver} disabled={busy} className="text-xs">
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
        onTemplate={() => downloadTemplate("products")}
        onInstructions={() => downloadInstructions("products")}
      />

      <SectionCard
        title="Upload your products"
        description="One row per item on the menu, with its price, stock and recipe."
        icon={<Upload className="h-4 w-4 text-amber-800" />}
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
