"use client";

import React, { useCallback, useId, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  ClipboardPaste,
  Download,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Source picker: upload a file, or paste straight out of Excel               */
/* -------------------------------------------------------------------------- */

export function SourcePicker({
  onFile,
  onPaste,
  disabled,
  acceptedNote,
}: {
  onFile: (file: File) => void;
  onPaste: (text: string) => void;
  disabled?: boolean;
  acceptedNote: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-amber-700 bg-amber-50"
            : "border-stone-300 bg-stone-50/60 hover:border-amber-600/60",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-900 text-amber-50">
          <CloudUpload className="h-6 w-6" />
        </div>
        <p className="text-sm font-bold text-stone-900">Drop your spreadsheet here</p>
        <p className="mt-1 text-xs text-stone-500">{acceptedNote}</p>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv,.txt,.tsv,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          className="mt-4 h-9 border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:bg-stone-100"
        >
          Choose file
        </Button>
      </div>

      {/* Paste box */}
      <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardPaste className="h-4 w-4 text-amber-800" />
          <p className="text-sm font-bold text-stone-900">Or paste from Excel</p>
        </div>
        <p className="mb-3 text-xs text-stone-500">
          In Excel or Google Sheets, select the cells (including the header row) and copy them with
          Ctrl+C. Paste below.
        </p>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          disabled={disabled}
          rows={7}
          spellCheck={false}
          placeholder={"Product Name\tSelling Price\tStock\nChocolate Truffle\t750\t10"}
          className="w-full flex-1 resize-y rounded-lg border border-stone-300 bg-stone-50 p-3 font-mono text-[11px] leading-relaxed text-stone-900 outline-none placeholder:text-stone-400 focus:border-amber-700 focus:ring-1 focus:ring-amber-700/20 disabled:opacity-50"
        />
        <Button
          type="button"
          onClick={() => onPaste(pasteText)}
          disabled={disabled || pasteText.trim().length === 0}
          className="mt-3 h-9 bg-amber-900 text-xs font-semibold text-white hover:bg-amber-950"
        >
          Use pasted rows
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Template / help download row                                               */
/* -------------------------------------------------------------------------- */

export function TemplateBar({
  onTemplate,
  onInstructions,
  templateLabel = "Download template",
}: {
  onTemplate: () => void;
  onInstructions?: () => void;
  templateLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
      <FileText className="h-4 w-4 shrink-0 text-amber-800" />
      <p className="mr-auto text-[11px] leading-relaxed text-amber-950">
        <span className="font-semibold">Start from the template.</span> It already has the right
        columns and one worked example row.
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onTemplate}
        className="h-8 gap-1.5 border-amber-300 bg-white text-[11px] font-semibold text-amber-900 hover:bg-amber-100"
      >
        <Download className="h-3.5 w-3.5" />
        {templateLabel}
      </Button>
      {onInstructions && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onInstructions}
          className="h-8 gap-1.5 border-amber-300 bg-white text-[11px] font-semibold text-amber-900 hover:bg-amber-100"
        >
          <FileText className="h-3.5 w-3.5" />
          How to use
        </Button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Row status + issue list                                                    */
/* -------------------------------------------------------------------------- */

export function ActionBadge({ action }: { action: "create" | "update" | "skip" }) {
  if (action === "create") {
    return (
      <Badge variant="success" className="text-[10px]">
        New
      </Badge>
    );
  }
  if (action === "update") {
    return (
      <Badge variant="warning" className="text-[10px]">
        Update
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="text-[10px]">
      Skipped
    </Badge>
  );
}

export function IssueList({
  issues,
  className,
}: {
  issues: { message: string; severity: "error" | "warning" }[];
  className?: string;
}) {
  if (issues.length === 0) return null;
  return (
    <ul className={cn("space-y-0.5", className)}>
      {issues.map((issue, index) => (
        <li
          key={index}
          className={cn(
            "flex items-start gap-1 text-[10px] leading-snug",
            issue.severity === "error" ? "text-red-700" : "text-amber-700"
          )}
        >
          {issue.severity === "error" ? (
            <X className="mt-px h-3 w-3 shrink-0" />
          ) : (
            <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
          )}
          <span>{issue.message}</span>
        </li>
      ))}
    </ul>
  );
}

export function FieldDiffList({
  diffs,
  className,
}: {
  diffs?: { field: string; label: string; oldValue: string; newValue: string }[];
  className?: string;
}) {
  if (!diffs || diffs.length === 0) return null;
  return (
    <div className={cn("space-y-1 text-[11px]", className)}>
      <span className="font-semibold text-stone-500 uppercase text-[9px] tracking-wider block">
        Modified fields ({diffs.length}):
      </span>
      <div className="flex flex-wrap gap-1.5">
        {diffs.map((d, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded bg-amber-50/90 px-2 py-0.5 border border-amber-200 text-amber-950 font-mono text-[10px]"
          >
            <span className="font-semibold text-stone-800">{d.label}:</span>
            <span className="line-through text-stone-400">{d.oldValue}</span>
            <span className="text-amber-800 font-bold">→</span>
            <span className="font-bold text-emerald-800">{d.newValue}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ErrorReportButton({
  onDownload,
  errorCount,
  warningCount,
}: {
  onDownload: () => void;
  errorCount: number;
  warningCount: number;
}) {
  if (errorCount === 0 && warningCount === 0) return null;
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onDownload}
      className="h-8 gap-1.5 border-red-300 bg-red-50 text-[11px] font-semibold text-red-900 hover:bg-red-100 hover:text-red-950"
    >
      <Download className="h-3.5 w-3.5 text-red-700" />
      Download error report ({errorCount} error{errorCount === 1 ? "" : "s"}
      {warningCount > 0 ? `, ${warningCount} warning${warningCount === 1 ? "" : "s"}` : ""})
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary counters                                                           */
/* -------------------------------------------------------------------------- */

export function SummaryBar({
  create,
  update,
  skip,
  warnings,
  errors,
}: {
  create: number;
  update: number;
  skip: number;
  warnings: number;
  errors: number;
}) {
  const tiles = [
    { label: "New", value: create, tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { label: "Updates", value: update, tone: "text-amber-800 bg-amber-50 border-amber-200" },
    ...(skip > 0
      ? [{ label: "Skipped", value: skip, tone: "text-stone-600 bg-stone-100 border-stone-200" }]
      : []),
    ...(warnings > 0
      ? [{ label: "Warnings", value: warnings, tone: "text-amber-800 bg-amber-50/70 border-amber-200/70" }]
      : []),
    ...(errors > 0
      ? [{ label: "Errors", value: errors, tone: "text-red-700 bg-red-50 border-red-200" }]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={cn("rounded-xl border px-3 py-2.5", tile.tone)}
        >
          <p className="text-xl font-bold leading-none">{tile.value}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider opacity-80">
            {tile.label}
          </p>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Progress + result banner                                                   */
/* -------------------------------------------------------------------------- */

export function ProgressNote({ label, current, total }: { label: string; current: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700">
        <span className="flex items-center gap-1.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-800" />
          {label}
        </span>
        <span className="tabular-nums text-stone-500">
          {current} / {total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-amber-800 transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Banner({
  tone,
  title,
  children,
  onDismiss,
}: {
  tone: "success" | "error" | "info";
  title: string;
  children?: React.ReactNode;
  onDismiss?: () => void;
}) {
  const tones = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
    info: "border-stone-200 bg-stone-50 text-stone-800",
  } as const;

  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border p-3.5", tones[tone])}>
      {tone === "success" ? (
        <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-emerald-600" />
      ) : tone === "error" ? (
        <AlertTriangle className="mt-px h-4 w-4 shrink-0 text-red-600" />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold">{title}</p>
        {children && <div className="mt-1 text-[11px] leading-relaxed">{children}</div>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 opacity-50 hover:opacity-100" aria-label="Dismiss">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Modal-ish inline section                                                   */
/* -------------------------------------------------------------------------- */

export function SectionCard({
  title,
  description,
  icon,
  action,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h2 className="text-sm font-bold text-stone-900">{title}</h2>
            {description && <p className="text-[11px] text-stone-500">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Checkbox row used for import options. */
export function CheckOption({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-2.5 rounded-xl border border-stone-200 bg-stone-50/60 p-3 transition-colors hover:border-stone-300",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-amber-800"
      />
      <span>
        <span className="block text-xs font-semibold text-stone-900">{label}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-stone-500">{hint}</span>
      </span>
    </label>
  );
}

/** Small pill used in the preview table headers. */
export function ColumnHint({ label, example }: { label: string; example?: string }) {
  return (
    <span className="inline-flex flex-col">
      <span>{label}</span>
      {example && <span className="font-normal text-stone-400">{example}</span>}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin text-amber-800", className)} />;
}
