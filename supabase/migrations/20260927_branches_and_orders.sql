-- ==============================================================================
-- Kichee's Baked Delights: Branches, Multi-Outlet Inventory & Delivery Migration
-- ==============================================================================

-- 1. Branches / Outlets Table
CREATE TABLE IF NOT EXISTS public.branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  address TEXT NOT NULL,
  area TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Chennai',
  pincode TEXT NOT NULL DEFAULT '600034',
  phone TEXT,
  hours TEXT,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_pickup_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Chennai Outlets: Harrisons Hotel & Casablanca Studio Nungambakkam
INSERT INTO public.branches (id, name, short_name, address, area, city, pincode, phone, hours, latitude, longitude)
VALUES 
  ('harrisons', 'Kichee''s Baked Delights - Harrisons Hotel', 'Harrisons Hotel (Valluvar Kottam)', 'No. 315, Harrisons Hotel, Next to Bosch Showroom, Valluvar Kottam High Road, Nungambakkam, Chennai - 600034, Tamil Nadu', 'Valluvar Kottam High Road', 'Chennai', '600034', '+91 98846 31078', '9:00 AM - 10:30 PM', 13.056900, 80.242500),
  ('nungambakkam', 'Kichee''s Baked Delights - Casablanca Studio', 'Casablanca Studio (Thirumoorthy Nagar)', 'Flat No. S2, Ground Floor, KG Casablanca-1, 17/18, Dr. Thirumoorthy Nagar Main Road, Nungambakkam, Chennai - 600034, Tamil Nadu', 'Dr. Thirumoorthy Nagar', 'Chennai', '600034', '+91 98846 31078', '8:00 AM - 11:00 PM', 13.060100, 80.237200)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  hours = EXCLUDED.hours,
  updated_at = now();

-- 2. Products Outlet Association
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS branch_ids JSONB DEFAULT '["harrisons", "nungambakkam"]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS available_branches TEXT DEFAULT 'all';

-- 3. Orders Outlet, Distance & WhatsApp Tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS branch_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS branch_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_distance_km NUMERIC(6, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT;

-- 4. Customer OTP Verification Table for Evolution WhatsApp Login
CREATE TABLE IF NOT EXISTS public.customer_otps (
  phone TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active branches" ON public.branches;
CREATE POLICY "Public can view active branches" ON public.branches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage branches" ON public.branches;
CREATE POLICY "Admins can manage branches" ON public.branches FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');
