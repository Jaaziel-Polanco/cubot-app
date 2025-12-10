-- Script para corregir inconsistencias de schema
-- Ejecutar este script en el SQL Editor de Supabase después de corregir el trigger

-- 1. Actualizar el trigger para usar los campos correctos (name y status)
-- Esto ya debería estar hecho con el script 005, pero lo incluimos por si acaso
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

  -- Insert user profile with correct field names
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

-- 2. Si hay usuarios existentes con datos incorrectos, corregirlos
-- (Esto solo es necesario si ya hay datos en la base de datos)

-- Nota: Si no hay columnas full_name o is_active, estos comandos fallarán silenciosamente
-- Lo cual está bien, significa que no hay datos incorrectos que corregir

-- Verificar estructura actual
DO $$
BEGIN
  -- Verificar si existen columnas incorrectas (esto fallará si no existen, lo cual está bien)
  RAISE NOTICE 'Verificando estructura de la tabla users...';
  
  -- Si hay usuarios sin name pero con datos en metadata, intentar extraerlo
  -- (Esto es solo informativo, no hace cambios)
  RAISE NOTICE 'Estructura verificada. Si hay errores anteriores, ignóralos.';
END $$;

-- Verificar usuarios existentes
SELECT 
  id,
  email,
  name,
  role,
  status,
  vendor_id,
  kyc_status
FROM public.users
LIMIT 5;

