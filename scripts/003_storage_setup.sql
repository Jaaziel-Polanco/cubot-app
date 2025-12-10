-- Create storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc', 'kyc', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for payment CSVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payments', 'payments', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies before creating them to avoid conflicts
-- Storage policies for evidence bucket
DROP POLICY IF EXISTS "Vendors can upload evidence" ON storage.objects;
CREATE POLICY "Vendors can upload evidence" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'evidence' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Vendors can view their own evidence" ON storage.objects;
CREATE POLICY "Vendors can view their own evidence" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'evidence' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Admins can view all evidence" ON storage.objects;
CREATE POLICY "Admins can view all evidence" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'evidence' AND
    get_user_role() = 'admin'
  );

-- Storage policies for KYC bucket
DROP POLICY IF EXISTS "Vendors can upload KYC docs" ON storage.objects;
CREATE POLICY "Vendors can upload KYC docs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kyc' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Vendors can view their own KYC docs" ON storage.objects;
CREATE POLICY "Vendors can view their own KYC docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kyc' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Admins can view all KYC docs" ON storage.objects;
CREATE POLICY "Admins can view all KYC docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kyc' AND
    get_user_role() = 'admin'
  );

-- Storage policies for payments bucket
DROP POLICY IF EXISTS "Admins can manage payment CSVs" ON storage.objects;
CREATE POLICY "Admins can manage payment CSVs" ON storage.objects
  FOR ALL USING (
    bucket_id = 'payments' AND
    get_user_role() = 'admin'
  );
