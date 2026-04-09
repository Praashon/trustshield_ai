-- Run this entirely in your Supabase SQL Editor to fix the infinite recursion

-- 1. Drop the recursive policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all scans" ON public.scans;
DROP POLICY IF EXISTS "Admins can view all analysis results" ON public.analysis_results;
DROP POLICY IF EXISTS "Admins can insert learning content" ON public.learning_content;
DROP POLICY IF EXISTS "Admins can update learning content" ON public.learning_content;
DROP POLICY IF EXISTS "Admins can view all attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Admins can view admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Admins can insert admin actions" ON public.admin_actions;

-- 2. Create a SECURITY DEFINER function to bypass RLS when checking admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_user_admin BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO is_user_admin 
  FROM public.users 
  WHERE id = auth.uid();
  
  RETURN COALESCE(is_user_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Recreate policies using the secure function
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can view all scans" ON public.scans FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all analysis results" ON public.analysis_results FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert learning content" ON public.learning_content FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update learning content" ON public.learning_content FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can view all attempts" ON public.quiz_attempts FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view admin actions" ON public.admin_actions FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert admin actions" ON public.admin_actions FOR INSERT WITH CHECK (public.is_admin());
