-- Add payment tracking columns to campaigns table
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'free' CHECK (payment_status IN ('free', 'pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS transaction_code TEXT,
ADD COLUMN IF NOT EXISTS payment_country TEXT,
ADD COLUMN IF NOT EXISTS payment_amount INTEGER DEFAULT 0;

-- Add index for efficient filtering of pending campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_payment_status ON public.campaigns(payment_status);

-- Comment the columns for documentation
COMMENT ON COLUMN public.campaigns.payment_status IS 'Payment status: free (photo), pending/approved/rejected (video)';
COMMENT ON COLUMN public.campaigns.transaction_code IS 'Mobile Money transaction code';
COMMENT ON COLUMN public.campaigns.payment_country IS 'Country code: BF, CI, ML, OTHER';
COMMENT ON COLUMN public.campaigns.payment_amount IS 'Amount paid in FCFA';