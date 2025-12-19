-- Create a function to increment views that bypasses RLS
CREATE OR REPLACE FUNCTION public.increment_campaign_views(campaign_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.campaigns
  SET views = views + 1
  WHERE id = campaign_id;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.increment_campaign_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_campaign_views(UUID) TO authenticated;

-- Drop the redundant SELECT policy (keep the public one)
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;