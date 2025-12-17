-- Create storage bucket for campaign images
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-images', 'campaign-images', true);

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload campaign images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'campaign-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view campaign images (public bucket)
CREATE POLICY "Anyone can view campaign images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'campaign-images');

-- Allow users to update their own images
CREATE POLICY "Users can update own campaign images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'campaign-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own campaign images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'campaign-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);