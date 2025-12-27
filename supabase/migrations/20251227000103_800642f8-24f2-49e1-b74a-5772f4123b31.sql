-- Function to check if user is super admin (using text comparison to avoid enum issue)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = 'super_admin'
  )
$$;

-- Super admin can view all user_roles
CREATE POLICY "Super admin can view all roles"
ON public.user_roles
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Super admin can manage all roles
CREATE POLICY "Super admin can manage all roles"
ON public.user_roles
FOR ALL
USING (is_super_admin(auth.uid()));