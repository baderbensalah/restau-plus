-- ==============================================================================
-- 🚀 THE COMPREHENSIVE MASTER REPAIR SCRIPT 🚀
-- ==============================================================================
-- This script fixes EVERY database issue found:
-- 1. Missing columns (description, slug, colors, contact info, etc.)
-- 2. Role issues (ensures you are marked as 'owner')
-- 3. Permission issues (fixes RLS for Dashboard and Website)
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Copy ALL the code below.
-- 2. Go to your Supabase Dashboard -> SQL Editor (left sidebar).
-- 3. Paste the code and click "RUN".
-- ==============================================================================

BEGIN;

-- 1. FIX COLUMN SCHEMA
-- Ensure all fields used in the Settings page exist in the database.
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#000000';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#ffffff';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS email_public TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS website_url TEXT;

-- ADD MISSING ORDER COLUMNS
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. ENSURE SLUG UNIQUENESS
-- Only add the unique constraint if it doesn't already exist.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'restaurants_slug_key') THEN
        ALTER TABLE restaurants ADD CONSTRAINT restaurants_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 3. ENSURE YOU ARE THE OWNER
-- This ensures your logged-in user has 'owner' permissions.
-- If this isn't set, Supabase will block you from saving.
UPDATE profiles 
SET role = 'owner' 
WHERE id = auth.uid();

-- 4. FIX STORAGE PERMISSIONS
-- This ensures you can upload logos and banners.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('restaurant-assets', 'restaurant-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'restaurant-assets');

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');

-- 5. FIX RESTAURANT PERMISSIONS (RLS)
-- Grant public read access (for the public website)
DROP POLICY IF EXISTS "Public Read Access" ON restaurants;
CREATE POLICY "Public Read Access" ON restaurants 
FOR SELECT 
TO public 
USING (true);

-- Grant update access to the owner (for your dashboard)
DROP POLICY IF EXISTS "Owners can update their restaurant" ON restaurants;
CREATE POLICY "Owners can update their restaurant" ON restaurants
FOR UPDATE 
TO authenticated
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = restaurants.id
    and profiles.role = 'owner'
  )
)
WITH CHECK (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = restaurants.id
    and profiles.role = 'owner'
  )
);

COMMIT;

-- ✅ SYSTEM REPAIRED. 
-- You can now refresh your dashboard, update your description, logo, and colors!
