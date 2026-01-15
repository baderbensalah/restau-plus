-- Create the storage bucket 'restaurant-assets'
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-assets', 'restaurant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Allow anyone (public) to view/read images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'restaurant-assets' );

-- RLS Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'restaurant-assets' );

-- RLS Policy: Allow owners to update/delete their own files (Optional but good)
-- For simplicity, we just allow authenticated users to update/delete in this bucket for now
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'restaurant-assets' );
