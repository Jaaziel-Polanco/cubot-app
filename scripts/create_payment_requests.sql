-- Create payment_requests table for vendor payment request workflow
-- This table tracks vendor requests to get paid for their pending commissions

CREATE TABLE IF NOT EXISTS public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  amount NUMERIC(12,2) NOT NULL,
  commission_ids UUID[] NOT NULL, -- Array of commission IDs included in this request
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  payment_batch_id UUID REFERENCES public.payment_batches(id) ON DELETE SET NULL,
  notes TEXT,
  rejected_reason TEXT,
  receipt_url TEXT, -- URL to payment receipt/voucher in 'payments' storage bucket
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_vendor ON public.payment_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_batch ON public.payment_requests(payment_batch_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_payment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_requests_updated_at
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_requests_updated_at();

-- Comments
COMMENT ON TABLE public.payment_requests IS 'Tracks vendor payment requests for pending commissions';
COMMENT ON COLUMN public.payment_requests.commission_ids IS 'Array of commission UUIDs included in this payment request';
COMMENT ON COLUMN public.payment_requests.status IS 'pending: waiting for admin approval, approved: admin approved but not paid yet, rejected: admin rejected, paid: payment completed';
