-- Add receipt_url column to existing payment_requests table
ALTER TABLE public.payment_requests 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

COMMENT ON COLUMN public.payment_requests.receipt_url IS 'URL to payment receipt/voucher in payments storage bucket';
