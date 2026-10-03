"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  History,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBulkImportJobs, type BulkImportJobRecord } from "@/lib/db/admin-data";
import { toCsv } from "@/lib/bulk-import/csv";
import { triggerDownload } from "@/lib/bulk-import/template";

export default function ImportHistory() {
  const [jobs, setJobs] = useState<BulkImportJobRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getBulkImportJobs();
      setJobs(data);
    } catch (err) {
      console.error("Error loading import history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDownloadJobErrors = (job: BulkImportJobRecord) => {
    if (!job.error_log || !Array.isArray(job.error_log) || job.error_log.length === 0) return;
    const headers = ["Row #", "SKU / Name", "Action", "Error Details"];
    const rows = job.error_log.map((item: any) => [
      item.index !== undefined ? item.index + 1 : "—",
      item.sku || item.name || "—",
      item.action || "skipped",
      item.error || "Unknown error",
    ]);
    const csv = toCsv(headers, rows);
    triggerDownload(csv, `job-${job.id}-errors.csv`, "text/csv;charset=utf-8");
  };

  const formatMode = (mode: string) => {
    switch (mode) {
      case "products":
        return "Products Upload";
      case "raw-materials":
        return "Raw Materials Upload";
      case "products-update":
        return "Products Bulk Update";
      case "raw-materials-update":
        return "Raw Materials Update";
      default:
        return mode;
    }
  };

  const formatStatus = (status: string) => {
    if (status === "completed") {
      return (
        <Badge variant="success" className="gap-1 text-[10px]">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      );
    }
    if (status === "partial") {
      return (
        <Badge variant="warning" className="gap-1 text-[10px]">
          <AlertTriangle className="h-3 w-3" />
          Partial
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1 text-[10px]">
        <XCircle className="h-3 w-3" />
        Failed
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900">Import & Update History</h2>
          <p className="text-xs text-stone-500">
            Audit log of all bulk catalog uploads and updates executed across your store.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchJobs}
          disabled={loading}
          className="h-8 gap-1.5 border-stone-300 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh history
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50">
              <TableHead className="w-40">Date & Time</TableHead>
              <TableHead className="w-36">Operation</TableHead>
              <TableHead className="min-w-[140px]">File / Source</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center text-emerald-800">Created</TableHead>
              <TableHead className="text-center text-amber-800">Updated</TableHead>
              <TableHead className="text-center text-stone-600">Skipped</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="text-xs text-stone-600 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-stone-400" />
                    <span>
                      {job.created_at
                        ? new Date(job.created_at).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-stone-800">
                    {formatMode(job.mode)}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-stone-600 truncate max-w-[200px]">
                  {job.file_name || "manual-upload"}
                </TableCell>
                <TableCell className="text-center font-mono text-xs font-semibold text-stone-900">
                  {job.total_rows}
                </TableCell>
                <TableCell className="text-center font-mono text-xs font-semibold text-emerald-700">
                  {job.created_count}
                </TableCell>
                <TableCell className="text-center font-mono text-xs font-semibold text-amber-700">
                  {job.updated_count}
                </TableCell>
                <TableCell className="text-center font-mono text-xs text-stone-500">
                  {job.skipped_count}
                </TableCell>
                <TableCell>{formatStatus(job.status)}</TableCell>
                <TableCell className="text-right">
                  {job.error_log && job.error_log.length > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadJobErrors(job)}
                      className="h-7 gap-1 px-2 text-[11px] font-semibold text-red-700 hover:bg-red-50"
                      title="Download error CSV"
                    >
                      <Download className="h-3 w-3" />
                      Errors
                    </Button>
                  ) : (
                    <span className="text-[11px] text-stone-400">Clean</span>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {jobs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-xs text-stone-500">
                  <History className="mx-auto mb-2 h-6 w-6 text-stone-300" />
                  No bulk import jobs recorded yet. Once you import or update products, they will appear here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
