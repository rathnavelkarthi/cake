-- ==============================================================================
-- Kichee's Baked Delights: Master Bulk System & Inventory Migration
-- Run this in your Supabase Project -> SQL Editor -> Click 'Run'
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

-- 2. Create raw_materials table if not present
CREATE TABLE IF NOT EXISTS public.raw_materials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  category TEXT NOT NULL DEFAULT 'General',
  stock NUMERIC(12, 3) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg' CHECK (unit IN ('kg', 'l', 'pcs')),
  min_threshold NUMERIC(12, 3) NOT NULL DEFAULT 5,
  cost_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  supplier TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS raw_materials_name_idx
  ON public.raw_materials (LOWER(name));
CREATE INDEX IF NOT EXISTS raw_materials_category_idx
  ON public.raw_materials (category);

-- Enable RLS for raw_materials
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active raw materials" ON public.raw_materials;
CREATE POLICY "Public can view active raw materials" ON public.raw_materials
  FOR SELECT USING (is_active = true OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can manage raw materials" ON public.raw_materials;
CREATE POLICY "Admins can manage raw materials" ON public.raw_materials
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 3. Bulk Import Jobs Table
CREATE TABLE IF NOT EXISTS public.bulk_import_jobs (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  file_name TEXT,
  total_rows INTEGER NOT NULL DEFAULT 0,
  created_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  summary JSONB,
  error_log JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bulk_import_jobs_created_at_idx
  ON public.bulk_import_jobs (created_at DESC);

ALTER TABLE public.bulk_import_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage bulk_import_jobs" ON public.bulk_import_jobs;
CREATE POLICY "Admins can manage bulk_import_jobs" ON public.bulk_import_jobs
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Refresh schema cache notification
NOTIFY pgrst, 'reload schema';
