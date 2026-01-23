-- Add is_featured column to public_visuals table
ALTER TABLE public.public_visuals 
ADD COLUMN is_featured boolean DEFAULT false;

-- Create index for featured visuals queries
CREATE INDEX idx_public_visuals_featured ON public.public_visuals(is_featured) WHERE is_featured = true;

-- Add comment for documentation
COMMENT ON COLUMN public.public_visuals.is_featured IS 'Whether this visual is featured/highlighted on the landing page';