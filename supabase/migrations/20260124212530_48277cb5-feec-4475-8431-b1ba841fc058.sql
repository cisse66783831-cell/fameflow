-- Add photo zone columns to campaigns table
ALTER TABLE public.campaigns 
  ADD COLUMN IF NOT EXISTS photo_zone_x integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS photo_zone_y integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS photo_zone_width integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS photo_zone_height integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS photo_zone_shape text DEFAULT 'circle',
  ADD COLUMN IF NOT EXISTS name_zone_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS name_zone_y integer DEFAULT 85;

-- Create public_videos table for featured videos on landing page
CREATE TABLE public.public_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  creator_name text NOT NULL,
  creator_photo text,
  user_id uuid REFERENCES auth.users(id),
  is_approved boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on public_videos
ALTER TABLE public.public_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for public_videos
CREATE POLICY "Anyone can view approved videos" ON public.public_videos
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Super admin can view all videos" ON public.public_videos
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can update videos" ON public.public_videos
  FOR UPDATE USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can delete videos" ON public.public_videos
  FOR DELETE USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can create videos" ON public.public_videos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own videos" ON public.public_videos
  FOR DELETE USING (auth.uid() = user_id);

-- Add display_order to public_visuals for ordering on landing page
ALTER TABLE public.public_visuals
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;