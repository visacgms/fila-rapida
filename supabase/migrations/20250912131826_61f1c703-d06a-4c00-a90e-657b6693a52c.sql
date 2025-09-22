-- Create a security definer function to get current user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE 
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "admins_can_manage_all_profiles" ON public.profiles;

-- Create a better admin policy using the security definer function
CREATE POLICY "admins_can_view_all_profiles"
ON public.profiles
FOR SELECT
USING (
  public.get_current_user_role() = 'admin'
  OR auth.uid() = user_id
);

CREATE POLICY "admins_can_update_all_profiles"
ON public.profiles
FOR UPDATE
USING (
  public.get_current_user_role() = 'admin'
  OR auth.uid() = user_id
);

CREATE POLICY "admins_can_insert_profiles"
ON public.profiles
FOR INSERT
WITH CHECK (
  public.get_current_user_role() = 'admin'
  OR auth.uid() = user_id
);