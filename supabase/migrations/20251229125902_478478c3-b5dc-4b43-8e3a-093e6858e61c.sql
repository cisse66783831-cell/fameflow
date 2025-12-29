-- Add new columns for video filters
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS frame_image_portrait TEXT,
ADD COLUMN IF NOT EXISTS frame_image_landscape TEXT;

-- Create index for slug lookup
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON public.campaigns(slug);

-- Create function to check if slug is available
CREATE OR REPLACE FUNCTION public.check_slug_availability(check_slug TEXT, exclude_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF exclude_id IS NOT NULL THEN
    RETURN NOT EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE slug = check_slug AND id != exclude_id
    );
  ELSE
    RETURN NOT EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE slug = check_slug
    );
  END IF;
END;
$$;