-- Drop existing restrictive policy for public view
DROP POLICY IF EXISTS "Anyone can view campaigns by id" ON public.campaigns;

-- Create a permissive policy that allows anyone to view any campaign
CREATE POLICY "Public can view all campaigns"
ON public.campaigns
FOR SELECT
TO public
USING (true);