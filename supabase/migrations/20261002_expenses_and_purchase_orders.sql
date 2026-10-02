-- ==============================================================================
-- Kichee's Baked Delights: Expenses & Purchase Orders System
-- Schema for expense tracking, suppliers, purchase orders, and email logging
-- ==============================================================================

-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  gstin TEXT,
  address TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  payment_terms TEXT NOT NULL DEFAULT 'Net 30 Days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode TEXT NOT NULL DEFAULT 'UPI',
  vendor TEXT NOT NULL,
  invoice_number TEXT,
  status TEXT NOT NULL DEFAULT 'PAID' CHECK (status IN ('PAID', 'PENDING', 'REIMBURSED')),
  recorded_by TEXT NOT NULL DEFAULT 'Admin',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS expenses_date_idx ON public.expenses (date DESC);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON public.expenses (category);

-- 3. Purchase Orders Table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id TEXT PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  tax_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT_TO_SUPPLIER', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED')),
  delivery_location TEXT NOT NULL,
  payment_terms TEXT NOT NULL DEFAULT 'Net 30 Days',
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  stock_updated BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS po_number_idx ON public.purchase_orders (po_number);
CREATE INDEX IF NOT EXISTS po_status_idx ON public.purchase_orders (status);

-- 4. Email Logs Table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id BIGSERIAL PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SENT',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
