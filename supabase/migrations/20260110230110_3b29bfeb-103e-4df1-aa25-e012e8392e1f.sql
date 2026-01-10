-- Create table for tracking anonymous download statistics
CREATE TABLE public.download_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'document')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  session_id TEXT
);

-- Index for stats queries
CREATE INDEX idx_download_stats_campaign ON download_stats(campaign_id);
CREATE INDEX idx_download_stats_event ON download_stats(event_id);
CREATE INDEX idx_download_stats_created ON download_stats(created_at);

-- Enable RLS
ALTER TABLE download_stats ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (no auth required)
CREATE POLICY "Anyone can insert download stats" 
  ON download_stats FOR INSERT 
  WITH CHECK (true);

-- Campaign owners can view their download stats
CREATE POLICY "Owners can view their campaign download stats"
  ON download_stats FOR SELECT
  USING (
    campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
    OR event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
  );