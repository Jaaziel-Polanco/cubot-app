-- Add identification_number field to users table for cédula/RNC
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS identification_number TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.users.identification_number IS 'Cédula de identidad o RNC - Requerido para verificación KYC';

