-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for authenticated users to upload event images
CREATE POLICY "Users can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.uid() IS NOT NULL
);

-- Policy for public view of event images
CREATE POLICY "Public can view event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- Policy for users to delete their own event images
CREATE POLICY "Users can delete own event images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix permissive RLS on download_stats (drop if exists then recreate)
DROP POLICY IF EXISTS "Anyone can insert download stats" ON download_stats;
CREATE POLICY "Authenticated users can insert download stats"
ON download_stats FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix permissive RLS on public_visuals
DROP POLICY IF EXISTS "Users can create visuals" ON public_visuals;
CREATE POLICY "Authenticated users can create visuals"
ON public_visuals FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);