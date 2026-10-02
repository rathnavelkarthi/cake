-- ==============================================================================
-- Kichee's Baked Delights: Pre-filled Cart Sessions Table
-- For AI Voice Agent & WhatsApp Pre-filled Order Links
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.cart_sessions (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  customer_phone TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  customer_notes TEXT,
  whatsapp_sent BOOLEAN NOT NULL DEFAULT false,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public read of cart sessions by session ID (so customers opening link can view their cart)
DROP POLICY IF EXISTS "Public can view active cart sessions" ON public.cart_sessions;
CREATE POLICY "Public can view active cart sessions" ON public.cart_sessions
  FOR SELECT USING (true);

-- Allow service role and admins to insert/update cart sessions
DROP POLICY IF EXISTS "Service role can manage cart sessions" ON public.cart_sessions;
CREATE POLICY "Service role can manage cart sessions" ON public.cart_sessions
  FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());
