-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema completo con todas las tablas requeridas

-- Users table with complete fields as per spec
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'vendor', 'validator', 'finance')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  vendor_id TEXT UNIQUE,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  kyc_verified_at TIMESTAMPTZ,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  bank_account TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products table with complete fields
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Flagship', 'Mid-Range', 'Rugged', 'Budget')),
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_amount NUMERIC(12,2) DEFAULT 0,
  commission_percent NUMERIC(5,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sales table with all required fields including risk analysis
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id TEXT UNIQUE NOT NULL,
  vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  imei TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  channel TEXT NOT NULL CHECK (channel IN ('Online', 'Tienda Fisica', 'Marketplace', 'Venta Telefonica')),
  sale_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  evidence_url TEXT,
  notes TEXT,
  rejection_reason TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  ip TEXT,
  user_agent TEXT,
  validated_by UUID REFERENCES public.users(id),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index for approved IMEI only
CREATE UNIQUE INDEX IF NOT EXISTS uq_sales_imei_approved
  ON public.sales (imei) WHERE (status = 'approved');

CREATE INDEX IF NOT EXISTS idx_sales_vendor ON public.sales(vendor_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_imei ON public.sales(imei);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(sale_date);

-- Individual commissions table (one per approved sale)
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  base_amount NUMERIC(12,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid')),
  payment_batch_id UUID REFERENCES public.payment_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_vendor ON public.commissions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_sale ON public.commissions(sale_id);

-- Commission schemes table as per spec
CREATE TABLE IF NOT EXISTS public.commission_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(12,2) NOT NULL,
  min_sales INTEGER,
  max_commission NUMERIC(12,2),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product-scheme mapping table
CREATE TABLE IF NOT EXISTS public.product_commission_scheme (
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  scheme_id UUID REFERENCES public.commission_schemes(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, scheme_id)
);

-- Vendor commissions aggregation by period
CREATE TABLE IF NOT EXISTS public.vendor_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sales INTEGER NOT NULL DEFAULT 0,
  total_sales_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_commissions NUMERIC(14,2) NOT NULL DEFAULT 0,
  bonuses NUMERIC(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid')),
  paid_at TIMESTAMPTZ,
  payment_batch_id UUID REFERENCES public.payment_batches(id) ON DELETE SET NULL,
  payment_receipt_id TEXT,  -- Stores batch_id text for reference
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vendor_id, period_start, period_end)
);

-- Payment batches table
CREATE TABLE IF NOT EXISTS public.payment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT UNIQUE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('weekly', 'biweekly', 'monthly')),
  total_vendors INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  csv_url TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key from vendor_commissions to payment_batches
ALTER TABLE public.vendor_commissions 
  ADD CONSTRAINT fk_payment_batch 
  FOREIGN KEY (payment_batch_id) 
  REFERENCES public.payment_batches(id) 
  ON DELETE SET NULL;

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- KYC documents table with document type constraints
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('INE', 'PASSPORT', 'DRIVER_LICENSE', 'PROOF_OF_ADDRESS')),
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Banks table (configured by admin)
CREATE TABLE IF NOT EXISTS public.banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,  -- Bank code (e.g., "BHD", "BANRESERVAS")
  country TEXT NOT NULL DEFAULT 'DO',  -- Country code (default: Dominican Republic)
  active BOOLEAN NOT NULL DEFAULT TRUE,
  account_number_format TEXT,  -- Format hint (e.g., "20 digits")
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vendor bank accounts table
CREATE TABLE IF NOT EXISTS public.vendor_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE RESTRICT,
  account_number TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,  -- Name on the account
  account_type TEXT CHECK (account_type IN ('checking', 'savings', 'current')),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,  -- Admin can verify accounts
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vendor_id, bank_id, account_number)  -- One account per bank per vendor
);

-- Ensure only one primary account per vendor
CREATE UNIQUE INDEX IF NOT EXISTS uq_vendor_primary_account
  ON public.vendor_bank_accounts (vendor_id) WHERE (is_primary = TRUE);

-- Audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  diff JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_commissions_vendor ON public.vendor_commissions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_commissions_status ON public.vendor_commissions(status);
CREATE INDEX IF NOT EXISTS idx_vendor_commissions_batch ON public.vendor_commissions(payment_batch_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_kyc_vendor ON public.kyc_documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_banks_active ON public.banks(active);
CREATE INDEX IF NOT EXISTS idx_vendor_bank_accounts_vendor ON public.vendor_bank_accounts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bank_accounts_bank ON public.vendor_bank_accounts(bank_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bank_accounts_primary ON public.vendor_bank_accounts(vendor_id, is_primary);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_commissions_updated_at BEFORE UPDATE ON public.vendor_commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_schemes_updated_at BEFORE UPDATE ON public.commission_schemes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON public.banks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_bank_accounts_updated_at BEFORE UPDATE ON public.vendor_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
