-- Update payment_requests to use vendor_bank_account_id instead of bank_account_used text
ALTER TABLE public.payment_requests 
DROP COLUMN IF EXISTS bank_account_used;

ALTER TABLE public.payment_requests 
ADD COLUMN IF NOT EXISTS vendor_bank_account_id UUID REFERENCES public.vendor_bank_accounts(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.payment_requests.vendor_bank_account_id IS 'The vendor bank account selected for this payment';
