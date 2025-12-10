-- Fix RLS Infinite Recursion Issue
-- 1. Make get_user_role robust and ensure it bypasses RLS
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- 2. Ensure Users table policies don't cause recursion for the self-check
-- Drop existing policies to be safe/clean slate for users table select
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Vendors can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users; -- potential dup name

-- Recreate basic self-view policy (this is always safe)
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Recreate admin view all policy
-- Since get_user_role is SECURITY DEFINER, it won't trigger this policy recursively
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (get_user_role() = 'admin');

-- 3. Ensure Sales table has correct admin policy
DROP POLICY IF EXISTS "Admins can view all sales" ON public.sales;

CREATE POLICY "Admins can view all sales" ON public.sales
  FOR SELECT USING (get_user_role() = 'admin');

-- 4. Ensure Validation Queue (pending sales) works
-- This is covered by "Admins can view all sales" but let's double check there isn't a conflicting policy
