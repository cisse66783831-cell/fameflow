-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Authenticated users can insert download stats" ON public.download_stats;

-- Create a new policy that allows anyone (including anonymous users) to insert download stats
CREATE POLICY "Anyone can insert download stats" 
ON public.download_stats 
FOR INSERT 
WITH CHECK (true);

-- Add optional columns for anonymous user info
ALTER TABLE public.download_stats 
ADD COLUMN IF NOT EXISTS device_type text,
ADD COLUMN IF NOT EXISTS browser text,
ADD COLUMN IF NOT EXISTS os text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS city text;