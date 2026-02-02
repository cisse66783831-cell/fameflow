-- Add watermark status field to campaigns table
-- 'active' = watermark visible (default)
-- 'pending' = removal requested, awaiting admin approval
-- 'removed' = admin approved removal, no watermark

ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS watermark_status TEXT DEFAULT 'active' CHECK (watermark_status IN ('active', 'pending', 'removed'));

-- Add watermark removal request date
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS watermark_removal_requested_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.campaigns.watermark_status IS 'Watermark status: active (default), pending (removal requested), removed (admin approved)';