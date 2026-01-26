-- Create shared_visuals table for storing user-generated visuals with sharing metadata
CREATE TABLE public.shared_visuals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_name text NOT NULL,
  visual_url text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  views integer DEFAULT 0,
  CONSTRAINT shared_visuals_has_parent CHECK (event_id IS NOT NULL OR campaign_id IS NOT NULL)
);

-- Enable Row Level Security
ALTER TABLE public.shared_visuals ENABLE ROW LEVEL SECURITY;

-- Anyone can view shared visuals
CREATE POLICY "Anyone can view shared visuals"
ON public.shared_visuals
FOR SELECT
USING (true);

-- Anyone can create shared visuals (public feature)
CREATE POLICY "Anyone can create shared visuals"
ON public.shared_visuals
FOR INSERT
WITH CHECK (true);

-- Super admin can manage all shared visuals
CREATE POLICY "Super admin can manage shared visuals"
ON public.shared_visuals
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create index for fast lookups by id
CREATE INDEX idx_shared_visuals_id ON public.shared_visuals(id);
CREATE INDEX idx_shared_visuals_event ON public.shared_visuals(event_id);
CREATE INDEX idx_shared_visuals_campaign ON public.shared_visuals(campaign_id);