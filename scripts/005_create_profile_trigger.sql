-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vendor_count INTEGER;
  new_vendor_id TEXT;
BEGIN
  -- Count existing vendors to generate vendor ID
  SELECT COUNT(*) INTO vendor_count
  FROM users
  WHERE role = 'vendor';

  new_vendor_id := 'VND-' || LPAD((vendor_count + 1)::TEXT, 3, '0');

  -- Insert user profile
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    vendor_id,
    status,
    kyc_status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    'vendor',
    new_vendor_id,
    'active',
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
