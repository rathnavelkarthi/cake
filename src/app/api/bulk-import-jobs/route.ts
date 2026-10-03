import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface BulkImportJobPayload {
  id?: string;
  mode: string;
  fileName?: string;
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  warningCount: number;
  status?: "completed" | "failed" | "partial";
  summary?: Record<string, unknown>;
  errorLog?: unknown[];
}

// In-memory fallback if the database table hasn't been migrated yet
const localJobsStore: Record<string, unknown>[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));

    const { data, error } = await supabaseAdmin
      .from("bulk_import_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      // Table might not exist yet; return local in-memory jobs gracefully
      return NextResponse.json({
        jobs: localJobsStore.slice(0, limit),
        fallback: true,
      });
    }

    return NextResponse.json({
      jobs: data ?? [],
    });
  } catch (err) {
    console.error("GET /api/bulk-import-jobs error:", err);
    return NextResponse.json({
      jobs: localJobsStore.slice(0, 20),
      fallback: true,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: BulkImportJobPayload = await req.json();

    const jobId = body.id || `bij-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const jobRecord = {
      id: jobId,
      mode: body.mode,
      file_name: body.fileName || "manual-upload",
      total_rows: Number(body.totalRows || 0),
      created_count: Number(body.createdCount || 0),
      updated_count: Number(body.updatedCount || 0),
      skipped_count: Number(body.skippedCount || 0),
      error_count: Number(body.errorCount || 0),
      warning_count: Number(body.warningCount || 0),
      status: body.status || (body.errorCount > 0 ? "partial" : "completed"),
      summary: body.summary || {},
      error_log: body.errorLog || [],
      created_at: new Date().toISOString(),
    };

    // Store in local store as well
    localJobsStore.unshift(jobRecord);
    if (localJobsStore.length > 100) localJobsStore.pop();

    const { error } = await supabaseAdmin
      .from("bulk_import_jobs")
      .insert([jobRecord]);

    if (error) {
      console.warn("Could not persist bulk_import_job to database, kept in memory fallback:", error.message);
    }

    return NextResponse.json({ success: true, job: jobRecord });
  } catch (err) {
    console.error("POST /api/bulk-import-jobs error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record bulk import job" },
      { status: 500 }
    );
  }
}
