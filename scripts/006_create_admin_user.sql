-- Script para crear/actualizar usuario admin en Supabase
-- Ejecutar este script en el SQL Editor de Supabase
-- 
-- IMPORTANTE: 
-- 1. Primero crea el usuario desde Supabase Dashboard > Authentication > Users > Add User
--    - Email: admin@scripts
--    - Password: (la que prefieras)
--    - Auto Confirm User: ✅ (marcar esta opción)
-- 2. Luego ejecuta este script para actualizar el perfil a admin

-- Actualizar o crear perfil de admin
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Buscar el usuario por email en auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'cubot001@hotmail.com';

  -- Si el usuario existe, crear/actualizar su perfil a admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.users (
      id,
      email,
      name,
      role,
      status,
      vendor_id,
      kyc_status,
      created_at,
      updated_at
    )
    VALUES (
      admin_user_id,
      'cubot001@hotmail.com',
      'Admin User',
      'admin',
      'active',
      NULL,
      'approved',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
      role = 'admin',
      status = 'active',
      vendor_id = NULL,
      kyc_status = 'approved',
      name = COALESCE(EXCLUDED.name, public.users.name),
      updated_at = NOW();
    
    RAISE NOTICE '✅ Usuario admin creado/actualizado correctamente con ID: %', admin_user_id;
  ELSE
    RAISE EXCEPTION '❌ Usuario no encontrado en auth.users. Por favor crea el usuario primero desde Supabase Dashboard > Authentication > Users > Add User con email: cubot001@hotmail.com';
  END IF;
END $$;

-- Verificar que el usuario fue creado correctamente
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.status,
  u.vendor_id,
  u.kyc_status,
  au.email_confirmed_at,
  au.created_at as auth_created_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'cubot001@hotmail.com';

