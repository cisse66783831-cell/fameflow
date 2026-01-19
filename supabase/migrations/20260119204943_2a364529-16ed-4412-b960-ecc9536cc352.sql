-- Create atomic function to increment campaign downloads (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.increment_campaign_downloads(campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.campaigns
  SET downloads = downloads + 1
  WHERE id = campaign_id;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.increment_campaign_downloads(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_campaign_downloads(uuid) TO authenticated;

-- Synchronize existing download counts from download_stats table
UPDATE campaigns c
SET downloads = COALESCE((
  SELECT COUNT(*) 
  FROM download_stats ds 
  WHERE ds.campaign_id = c.id
), 0);