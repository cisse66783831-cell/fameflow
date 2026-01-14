-- Add traffic source columns to download_stats
ALTER TABLE public.download_stats
ADD COLUMN IF NOT EXISTS referrer text,
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS utm_campaign text;

-- Create page_views table for time tracking
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  session_id text,
  page_path text NOT NULL,
  time_on_page integer, -- in seconds
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for tracking
CREATE POLICY "Anyone can insert page views"
ON public.page_views FOR INSERT WITH CHECK (true);

-- Owners can view their page views via campaigns
CREATE POLICY "Owners can view page views for their campaigns"
ON public.page_views FOR SELECT
USING (
  campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid())
  OR event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid())
);

-- Create index for faster queries
CREATE INDEX idx_page_views_campaign_id ON public.page_views(campaign_id);
CREATE INDEX idx_page_views_event_id ON public.page_views(event_id);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_download_stats_referrer ON public.download_stats(referrer);
CREATE INDEX idx_download_stats_created_at ON public.download_stats(created_at);