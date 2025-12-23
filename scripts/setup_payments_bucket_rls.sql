-- Make sure the payments bucket exists and is private
INSERT INTO storage.buckets (id, name, public)
VALUES ('payments', 'payments', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can read their own payment receipts" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload payment receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payments');

-- Allow admins to read all files
CREATE POLICY "Admins can read payment receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'payments' 
    AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Allow vendors to read their own payment receipts
CREATE POLICY "Vendors can read their own payment receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'payments' 
    AND EXISTS (
        SELECT 1 FROM public.payment_requests pr
        WHERE pr.vendor_id = auth.uid()
        AND pr.receipt_url = name
    )
);
