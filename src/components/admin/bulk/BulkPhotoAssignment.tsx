"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Images, RefreshCw, Upload } from "lucide-react";
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
  Banner,
  ProgressNote,
  SectionCard,
  SummaryBar,
} from "./shared";
import { IMAGE_ACCEPT, matchImages, type ImageMatch } from "@/lib/bulk-import/image-match";
import {
  getInventoryProducts,
  subscribeInventory,
  updateInventoryProduct,
  uploadImage,
  type AdminProductItem,
} from "@/lib/db/admin-data";
import { cn } from "@/lib/utils";

const REASON_LABEL: Record<ImageMatch["reason"], string> = {
  hint: "by filename",
  sku: "by SKU",
  name: "by name",
  slug: "by URL name",
  contains: "by name",
  unmatched: "no match",
};

/**
 * Assigns photos to products that already exist.
 *
 * The product importer can attach photos, but this tab exists for the common
 * follow-up: the menu is already live and the photos were shot later.
 */
export default function BulkPhotoAssignment() {
  const [products, setProducts] = useState<AdminProductItem[]>(getInventoryProducts);
  const [files, setFiles] = useState<File[]>([]);
  const [matches, setMatches] = useState<ImageMatch[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [done, setDone] = useState<{ applied: number; failed: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeInventory(() => setProducts(getInventoryProducts()));
  }, []);

  const targets = useMemo(
    () =>
      products.map((product, index) => ({
        index,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
      })),
    [products]
  );

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const images = Array.from(list).filter((file) => file.type.startsWith("image/"));
    const rejected = Array.from(list).length - images.length;
    if (rejected > 0) {
      setError(`${rejected} file${rejected === 1 ? " was" : "s were"} skipped because they are not images.`);
    } else {
      setError(null);
    }
    setDone(null);
    setFiles(images);
    setMatches(matchImages(images, targets).matches);
  };

  const handleApply = async () => {
    const paired = matches.filter((m) => m.file);
    if (paired.length === 0 || busy) return;

    setBusy(true);
    setError(null);
    setProgress({ current: 0, total: paired.length });
    const failed: string[] = [];
    let applied = 0;

    for (let i = 0; i < paired.length; i += 1) {
      const match = paired[i];
      const product = products[match.target.index];
      if (!product) continue;
      const url = await uploadImage(match.file!);
      if (url) {
        updateInventoryProduct(product.id, { imageUrl: url });
        applied += 1;
      } else {
        failed.push(`${product.name} (${match.file!.name})`);
      }
      setProgress({ current: i + 1, total: paired.length });
    }

    setDone({ applied, failed });
    setBusy(false);
  };

  const matched = matches.filter((m) => m.file);
  const unused = matches.length - matched.length;

  return (
    <div className="space-y-4">
      {error && (
        <Banner tone="error" title="Could not read that" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}

      {done && (
        <Banner
          tone={done.failed.length > 0 ? "info" : "success"}
          title={`${done.applied} photo${done.applied === 1 ? "" : "s"} saved`}
          onDismiss={() => setDone(null)}
        >
          {done.failed.length > 0 && (
            <ul className="list-inside list-disc space-y-0.5">
              {done.failed.map((name) => (
                <li key={name}>Could not save: {name}</li>
              ))}
            </ul>
          )}
        </Banner>
      )}

      <SectionCard
        title="Add photos to products you already have"
        description="Name each photo after the product. We match on filename first, then on SKU."
        icon={<Images className="h-4 w-4 text-amber-800" />}
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="h-8 gap-1.5 border-stone-300 bg-white text-[11px] font-semibold"
          >
            <Camera className="h-3.5 w-3.5" />
            Choose photos
          </Button>
        }
      >
        <input
          ref={inputRef}
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
          <p className="rounded-lg border border-dashed border-stone-300 bg-stone-50/60 p-6 text-center text-[11px] text-stone-500">
            Select a folder of photos, or hold Ctrl / Cmd to pick several at once.
          </p>
        ) : (
          <SummaryBar
            create={matched.length}
            update={0}
            skip={unused}
            warnings={0}
            errors={0}
          />
        )}
      </SectionCard>

      {files.length > 0 && (
        <SectionCard
          title={`${matched.length} product${matched.length === 1 ? "" : "s"} will get a photo`}
          icon={<Camera className="h-4 w-4 text-amber-800" />}
        >
          <div className="max-h-96 overflow-auto rounded-xl border border-stone-200">
            <Table>
              <TableHeader className="sticky top-0 bg-stone-50">
                <TableRow>
                  <TableHead className="text-[10px]">Product</TableHead>
                  <TableHead className="text-[10px]">SKU</TableHead>
                  <TableHead className="text-[10px]">Photo</TableHead>
                  <TableHead className="text-[10px]">Matched</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const match = matches.find((m) => m.target.index === products.indexOf(product));
                  return (
                    <TableRow
                      key={String(product.id)}
                      className={cn(!match?.file && files.length > 0 && "bg-stone-50/60")}
                    >
                      <TableCell className="text-xs font-semibold text-stone-900">
                        {product.name}
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-stone-500">
                        {product.sku}
                      </TableCell>
                      <TableCell className="text-[10px] text-stone-600">
                        {match?.file?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-[10px]">
                        {files.length === 0 ? (
                          <span className="text-stone-400">—</span>
                        ) : match?.file ? (
                          <span className="text-emerald-700">{REASON_LABEL[match.reason]}</span>
                        ) : (
                          <span className="text-stone-400">no match</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {busy && <ProgressNote label="Uploading photos" current={progress.current} total={progress.total} />}

          <Button
            onClick={handleApply}
            disabled={busy || matched.length === 0}
            className="bg-amber-900 text-xs font-semibold text-white hover:bg-amber-950"
          >
            {busy ? (
              <>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Save {matched.length} photo{matched.length === 1 ? "" : "s"}
              </>
            )}
          </Button>
        </SectionCard>
      )}
    </div>
  );
}
