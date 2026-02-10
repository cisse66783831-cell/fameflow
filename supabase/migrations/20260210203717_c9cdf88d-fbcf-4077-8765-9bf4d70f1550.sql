
-- Add payment columns for watermark removal
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS watermark_transaction_code text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS watermark_payment_country text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS watermark_payment_amount integer DEFAULT 1000;
