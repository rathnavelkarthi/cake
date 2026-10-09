"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  Image as ImageIcon,
  FileJson,
  Printer,
  FileCheck2,
  Calendar,
  Building2,
  Check,
  ChevronDown,
  Info,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AUDIT_EXPORT_FORMATS,
  AuditExportFormat,
  DEFAULT_EXPORT_SETTINGS,
  ExportSettingsConfig,
  executeAuditExport,
} from "@/lib/billing/audit-export";
import type { BillingInvoice } from "@/lib/billing/billing-store";

interface BillingExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeInvoice?: BillingInvoice | null;
  allInvoices: BillingInvoice[];
}

export function BillingExportModal({
  isOpen,
  onOpenChange,
  activeInvoice,
  allInvoices,
}: BillingExportModalProps) {
  // Format selection - defaults to XML (Data Interchange) matching user screenshot
  const [selectedFormat, setSelectedFormat] = useState<AuditExportFormat>("xml_tally");
  const [scope, setScope] = useState<"current" | "period">(
    activeInvoice ? "current" : "period"
  );
  const [dateFilter, setDateFilter] = useState<"october" | "30days" | "all">("october");
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Accounting Ledger Settings
  const [config, setConfig] = useState<ExportSettingsConfig>(DEFAULT_EXPORT_SETTINGS);

  // Filtered invoices based on scope and period
  const targetInvoices = useMemo(() => {
    if (scope === "current" && activeInvoice) {
      return [activeInvoice];
    }

    if (dateFilter === "october") {
      // October 2026 filter
      return allInvoices.filter((inv) => {
        const d = inv.rawDate || inv.createdAt || inv.date;
        return d.includes("2026-10") || inv.date.toLowerCase().includes("oct");
      });
    }

    if (dateFilter === "30days") {
      return allInvoices.slice(0, 30);
    }

    return allInvoices;
  }, [scope, activeInvoice, dateFilter, allInvoices]);

  // Totals for preview
  const totals = useMemo(() => {
    let taxable = 0;
    let cgst = 0;
    let sgst = 0;
    let grand = 0;

    targetInvoices.forEach((i) => {
      taxable += i.subtotal;
      if (i.includeGst) {
        cgst += i.tax / 2;
        sgst += i.tax / 2;
      }
      grand += i.grandTotal;
    });

    return {
      count: targetInvoices.length,
      taxable,
      cgst,
      sgst,
      tax: cgst + sgst,
      grand,
    };
  }, [targetInvoices]);

  const activeFormatMeta = useMemo(() => {
    return AUDIT_EXPORT_FORMATS.find((f) => f.id === selectedFormat)!;
  }, [selectedFormat]);

  const handleExecuteExport = async () => {
    if (targetInvoices.length === 0) {
      toast.error("No billing records found for the selected criteria.");
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading(
      `Generating ${activeFormatMeta.label} (${activeFormatMeta.extension})...`
    );

    try {
      const activeConfig: ExportSettingsConfig = {
        ...config,
        scope: scope === "current" ? "current" : "all",
        periodLabel:
          scope === "current"
            ? activeInvoice?.invoiceNumber || "Invoice"
            : dateFilter === "october"
            ? "October 2026"
            : "Audit Period",
      };

      await executeAuditExport(selectedFormat, targetInvoices, activeConfig);

      toast.dismiss(toastId);
      toast.success(
        `Export complete! ${targetInvoices.length} billing invoice${
          targetInvoices.length > 1 ? "s" : ""
        } exported in ${activeFormatMeta.label}.`
      );
      onOpenChange(false);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to generate export file.");
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (formatId: AuditExportFormat) => {
    switch (formatId) {
      case "ascii_csv":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-700" />;
      case "excel_xlsx":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case "html_web":
        return <FileCode className="w-4 h-4 text-amber-700" />;
      case "jpeg_image":
        return <ImageIcon className="w-4 h-4 text-rose-700" />;
      case "json_data":
        return <FileJson className="w-4 h-4 text-amber-600" />;
      case "pdf_doc":
        return <Printer className="w-4 h-4 text-blue-700" />;
      case "xml_tally":
        return <FileCode className="w-4 h-4 text-amber-900" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-stone-200 shadow-2xl">
        {/* Tally-inspired Top Banner */}
        <div className="bg-amber-950 text-white px-6 py-4 flex items-center justify-between border-b border-amber-900">
          <div>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-amber-100">
              <FileCheck2 className="w-5 h-5 text-amber-400" />
              <span>Export Settings</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-amber-200/80 mt-0.5">
              Generate statutory data formats for Chartered Accountants, GST Filing (GSTR-1), and Tally ERP / TallyPrime import.
            </DialogDescription>
          </div>
          <Badge className="bg-amber-900/80 border-amber-700 text-amber-200 text-xs px-2.5 py-1">
            Audit Ready
          </Badge>
        </div>

        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Main 2-Column Format Selector matching User Screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 rounded-xl border border-stone-200 bg-stone-50/70">
            {/* Left: Export Settings summary (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Export Settings
                </h3>
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">
                      File Format :
                    </label>
                    <div className="p-2.5 rounded-lg border border-amber-700/40 bg-amber-50/60 flex items-center justify-between text-xs font-bold text-amber-950 shadow-2xs">
                      <div className="flex items-center gap-2">
                        {getFormatIcon(selectedFormat)}
                        <span>{activeFormatMeta.label}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-white border-amber-300 text-amber-900 font-mono">
                        {activeFormatMeta.extension}
                      </Badge>
                    </div>
                  </div>

                  {/* Format description callout */}
                  <div className="p-3 rounded-lg border border-stone-200 bg-white text-xs space-y-1.5">
                    <p className="text-stone-700 font-medium leading-relaxed">
                      {activeFormatMeta.description}
                    </p>
                    <div className="pt-1.5 border-t border-stone-100 flex items-center gap-1.5 text-[11px] text-stone-500">
                      <span className="font-semibold text-stone-700">Compatible with:</span>
                      <span>{activeFormatMeta.compatibility}</span>
                    </div>
                  </div>

                  {/* Tally Highlight Notice if XML */}
                  {selectedFormat === "xml_tally" && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-emerald-950 font-bold">
                          Direct Tally XML Import
                        </strong>
                        <span>
                          Accountants can go to <em>Import Data &gt; Vouchers</em> in Tally ERP 9 / TallyPrime and import this file without manual entry.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: List of File Formats Listbox (7 cols) - Styled like the screenshot! */}
            <div className="md:col-span-7">
              <div className="rounded-lg border border-amber-900/30 overflow-hidden shadow-xs bg-white">
                <div className="bg-amber-900 text-white px-3.5 py-2 text-xs font-bold tracking-wide flex items-center justify-between">
                  <span>List of File Formats</span>
                  <span className="text-[10px] text-amber-200 font-normal">Select Format</span>
                </div>
                <div className="divide-y divide-stone-100 max-h-[310px] overflow-y-auto">
                  {AUDIT_EXPORT_FORMATS.map((fmt) => {
                    const isSelected = selectedFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setSelectedFormat(fmt.id)}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-100 text-amber-950 font-bold border-l-4 border-amber-900"
                            : "hover:bg-stone-50 text-stone-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {getFormatIcon(fmt.id)}
                          <span>{fmt.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              isSelected
                                ? "bg-amber-900 text-white"
                                : "bg-stone-100 text-stone-500"
                            }`}
                          >
                            {fmt.extension}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-900 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Scope & Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-2">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-800" />
                <span>Export Scope</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!activeInvoice}
                  onClick={() => setScope("current")}
                  className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                    scope === "current"
                      ? "border-amber-900 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-900"
                      : "border-stone-200 text-stone-600 hover:border-stone-300 disabled:opacity-40"
                  }`}
                >
                  <div className="font-semibold text-xs">Current Active Bill</div>
                  <div className="text-[10px] text-stone-500 mt-0.5 truncate">
                    {activeInvoice ? `#${activeInvoice.invoiceNumber}` : "No active bill loaded"}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScope("period")}
                  className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                    scope === "period"
                      ? "border-amber-900 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-900"
                      : "border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <div className="font-semibold text-xs">Billing Register (All)</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {allInvoices.length} historical invoices
                  </div>
                </button>
              </div>
            </div>

            {/* Date Range Selector if Scope is Register */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-2">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-800" />
                <span>Tax Filing Period Filter</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={scope === "current"}
                  onClick={() => setDateFilter("october")}
                  className={`p-2 rounded-lg border text-xs text-center transition-all ${
                    dateFilter === "october" && scope !== "current"
                      ? "border-amber-900 bg-amber-50/70 text-amber-950 font-bold"
                      : "border-stone-200 text-stone-600 hover:border-stone-300 disabled:opacity-40"
                  }`}
                >
                  October 2026
                </button>

                <button
                  type="button"
                  disabled={scope === "current"}
                  onClick={() => setDateFilter("30days")}
                  className={`p-2 rounded-lg border text-xs text-center transition-all ${
                    dateFilter === "30days" && scope !== "current"
                      ? "border-amber-900 bg-amber-50/70 text-amber-950 font-bold"
                      : "border-stone-200 text-stone-600 hover:border-stone-300 disabled:opacity-40"
                  }`}
                >
                  Last 30 Days
                </button>

                <button
                  type="button"
                  disabled={scope === "current"}
                  onClick={() => setDateFilter("all")}
                  className={`p-2 rounded-lg border text-xs text-center transition-all ${
                    dateFilter === "all" && scope !== "current"
                      ? "border-amber-900 bg-amber-50/70 text-amber-950 font-bold"
                      : "border-stone-200 text-stone-600 hover:border-stone-300 disabled:opacity-40"
                  }`}
                >
                  All Records
                </button>
              </div>
            </div>
          </div>

          {/* Audit Metrics Summary Preview */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <span className="text-xs font-bold text-stone-700">
                Data to be Exported Summary
              </span>
              <Badge variant="outline" className="bg-white text-stone-700 text-[11px]">
                {totals.count} Invoice{totals.count > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div>
                <span className="text-[10px] text-stone-500 font-semibold block uppercase">
                  Taxable Turnover
                </span>
                <span className="text-sm font-bold text-stone-900">
                  ₹{totals.taxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-stone-500 font-semibold block uppercase">
                  CGST (2.5%)
                </span>
                <span className="text-sm font-bold text-stone-900">
                  ₹{totals.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-stone-500 font-semibold block uppercase">
                  SGST (2.5%)
                </span>
                <span className="text-sm font-bold text-stone-900">
                  ₹{totals.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-stone-500 font-semibold block uppercase">
                  Grand Total Value
                </span>
                <span className="text-sm font-extrabold text-amber-950">
                  ₹{totals.grand.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Collapsible Tally / CA Accounting Ledgers Configuration */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-2.5 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-stone-500" />
                <span>Accounting & Tally Ledger Mapping (GSTIN: {config.gstin})</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-stone-400 transition-transform ${
                  showAdvanced ? "rotate-180" : ""
                }`}
              />
            </button>

            {showAdvanced && (
              <div className="p-4 bg-white border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600">Company Name (Tally)</label>
                  <Input
                    value={config.companyName}
                    onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600">GSTIN Registration</label>
                  <Input
                    value={config.gstin}
                    onChange={(e) => setConfig({ ...config, gstin: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600">Sales Ledger Account</label>
                  <Input
                    value={config.salesLedger}
                    onChange={(e) => setConfig({ ...config, salesLedger: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600">HSN/SAC Code</label>
                  <Input
                    value={config.hsnCode}
                    onChange={(e) => setConfig({ ...config, hsnCode: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600">CGST Ledger Account</label>
                  <Input
                    value={config.cgstLedger}
                    onChange={(e) => setConfig({ ...config, cgstLedger: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600">SGST Ledger Account</label>
                  <Input
                    value={config.sgstLedger}
                    onChange={(e) => setConfig({ ...config, sgstLedger: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-stone-500">
            Selected: <strong className="text-stone-800">{activeFormatMeta.label}</strong> ({totals.count} Invoices)
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-stone-600 text-xs h-9"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleExecuteExport}
              disabled={isExporting || totals.count === 0}
              className="bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs h-9 gap-1.5 shadow-sm px-4"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? "Exporting..." : `Export ${activeFormatMeta.badge} File`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
