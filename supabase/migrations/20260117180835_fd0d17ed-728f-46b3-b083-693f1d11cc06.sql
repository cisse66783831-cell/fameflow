-- Tighten overly permissive INSERT policies (avoid WITH CHECK (true))

-- download_stats
DROP POLICY IF EXISTS "Anyone can insert download stats" ON public.download_stats;
CREATE POLICY "Anyone can insert download stats"
ON public.download_stats
FOR INSERT
TO public
WITH CHECK (
  campaign_id IS NOT NULL OR event_id IS NOT NULL
);

-- page_views
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
TO public
WITH CHECK (
  campaign_id IS NOT NULL OR event_id IS NOT NULL
);