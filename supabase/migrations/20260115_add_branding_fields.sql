-- Add branding fields to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'modern',
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter';

-- Create storage bucket for restaurant assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('restaurant-assets', 'restaurant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to restaurant-assets bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'restaurant-assets');

-- Allow authenticated users to upload to restaurant-assets
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');
