-- Add featured columns to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 999;

-- Create index for efficient featured queries
CREATE INDEX IF NOT EXISTS idx_campaigns_featured ON public.campaigns(is_featured, display_order);