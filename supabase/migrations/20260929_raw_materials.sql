-- ==============================================================================
-- Kichee's Baked Delights: Raw Materials Inventory
-- Until now raw materials lived only in browser memory (hardcoded in
-- src/lib/db/admin-data.ts), so anything staff added was lost on refresh.
-- This migration gives raw materials a real table so they survive reloads,
-- support bulk import, and can back product recipes.
-- ==============================================================================

-- 1. Raw Materials / Ingredients Table
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

-- 2. Seed the ten raw materials that were previously hardcoded in the client
--    store, so existing recipes that reference rawMaterialId 1..10 stay valid.
INSERT INTO public.raw_materials (id, name, sku, category, stock, unit, min_threshold, cost_per_unit)
VALUES
  (1, 'Refined Wheat Flour (Maida)',                 'RAW-FLOUR-01',  'Flours & Grains',     50.0,  'kg', 15.0,  48),
  (2, 'High-Gluten Bread Flour (for Bagels)',        'RAW-BREAD-02',  'Flours & Grains',     35.0,  'kg', 10.0,  65),
  (3, '54% Callebaut Dark Belgian Chocolate',        'RAW-CHOC-01',   'Chocolates & Cocoa',  22.5,  'kg',  8.0, 850),
  (4, 'Unsalted Dairy Butter',                        'RAW-BUTTER-01', 'Dairy & Fats',        28.0,  'kg',  6.0, 520),
  (5, 'Granulated White Sugar',                       'RAW-SUGAR-01',  'Sugars & Sweeteners', 45.0,  'kg', 12.0,  45),
  (6, 'Active Dry Yeast',                            'RAW-YEAST-01',  'Leavening & Yeast',    4.2,  'kg',  1.5, 340),
  (7, 'Philadelphia Cream Cheese',                   'RAW-CHEESE-01', 'Dairy & Fats',        16.0,  'kg',  4.0, 680),
  (8, 'Heavy Dairy Whipping Cream',                  'RAW-CREAM-01',  'Dairy & Fats',        20.0,  'l',   5.0, 220),
  (9, 'Pure Madagascar Vanilla Extract',             'RAW-VANILLA-01','Flavours & Extracts',  2.5,  'l',   0.8, 1400),
  (10,'Toasted White Sesame Seeds',                   'RAW-SESAME-01', 'Seeds & Toppings',     8.0,  'kg',  2.0, 260)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category = EXCLUDED.category,
  unit = EXCLUDED.unit,
  min_threshold = EXCLUDED.min_threshold,
  cost_per_unit = EXCLUDED.cost_per_unit,
  updated_at = now();

-- Explicit inserts above bypass the sequence, so realign it before any
-- INSERT that relies on nextval. Without this the first auto id would be 1
-- and collide with the seeded rows.
SELECT setval(
  pg_get_serial_sequence('public.raw_materials', 'id'),
  GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.raw_materials), 1)
);

-- 3. Keep updated_at honest on every write
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS raw_materials_touch ON public.raw_materials;
CREATE TRIGGER raw_materials_touch
  BEFORE UPDATE ON public.raw_materials
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 4. Row Level Security (same policy shape as products)
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active raw materials" ON public.raw_materials;
CREATE POLICY "Public can view active raw materials" ON public.raw_materials
  FOR SELECT USING (is_active = true OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can manage raw materials" ON public.raw_materials;
CREATE POLICY "Admins can manage raw materials" ON public.raw_materials
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');
