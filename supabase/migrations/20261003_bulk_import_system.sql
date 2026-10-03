-- ==============================================================================
-- Kichee's Baked Delights: Bulk Import & Update System
-- Tracks bulk upload/update history, adds product_type to products table
-- ==============================================================================

-- 1. Add product_type to products table if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'product_type'
  ) THEN
    ALTER TABLE public.products ADD COLUMN product_type TEXT NOT NULL DEFAULT 'FINISHED_PRODUCT';
  END IF;
END $$;

-- 2. Bulk Import Jobs Table
CREATE TABLE IF NOT EXISTS public.bulk_import_jobs (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL, -- 'products' | 'raw-materials' | 'products-update' | 'raw-materials-update'
  file_name TEXT,
  total_rows INTEGER NOT NULL DEFAULT 0,
  created_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed', -- 'completed' | 'failed' | 'partial'
  summary JSONB,
  error_log JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bulk_import_jobs_created_at_idx
  ON public.bulk_import_jobs (created_at DESC);

-- RLS
ALTER TABLE public.bulk_import_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage bulk_import_jobs" ON public.bulk_import_jobs;
CREATE POLICY "Admins can manage bulk_import_jobs" ON public.bulk_import_jobs
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');
