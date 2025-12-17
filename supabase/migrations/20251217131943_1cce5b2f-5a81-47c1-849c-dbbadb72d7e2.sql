-- Drop existing permissive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create strict RLS policies for profiles table
-- Only authenticated users can view their own profile
CREATE POLICY "Users can view own profile only"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Only authenticated users can update their own profile
CREATE POLICY "Users can update own profile only"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Only authenticated users can insert their own profile
CREATE POLICY "Users can insert own profile only"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Only authenticated users can delete their own profile
CREATE POLICY "Users can delete own profile only"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);