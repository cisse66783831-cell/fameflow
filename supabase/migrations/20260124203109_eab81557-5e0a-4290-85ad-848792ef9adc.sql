-- Add photo zone columns to events table for defining where participant photos will appear
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS photo_zone_x integer DEFAULT 50;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS photo_zone_y integer DEFAULT 50;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS photo_zone_width integer DEFAULT 30;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS photo_zone_height integer DEFAULT 30;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS photo_zone_shape text DEFAULT 'circle';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS name_zone_enabled boolean DEFAULT true;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS name_zone_y integer DEFAULT 85;