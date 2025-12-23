-- Setup private storage buckets with RLS policies

-- 1. PAYMENTS BUCKET
-- Make sure the payments bucket exists and is private
INSERT INTO storage.buckets (id, name, public)
VALUES ('payments', 'payments', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can upload payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can read their own payment receipts" ON storage.objects;

-- Allow authenticated users to upload files to payments
CREATE POLICY "Authenticated users can upload payment receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payments');

-- Allow admins to read all payment files
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

-- 2. EVIDENCE BUCKET
-- Make sure the evidence bucket exists and is private
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can upload evidence" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all evidence" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can read their own evidence" ON storage.objects;

-- Allow authenticated users to upload evidence
CREATE POLICY "Authenticated users can upload evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence');

-- Allow admins to read all evidence
CREATE POLICY "Admins can read all evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'evidence' 
    AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Allow vendors to read their own evidence (files in their folder)
CREATE POLICY "Vendors can read their own evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'evidence' 
    AND name LIKE (auth.uid()::text || '/%')
);
