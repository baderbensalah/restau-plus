-- ==============================================================================
-- 🛠️ FINAL SYSTEM REPAIR SCRIPT 🛠️
-- ==============================================================================
-- This script resolves both:
-- 1. "Update Failed" error in Dashboard Settings
-- 2. "404 Not Found" error on the public website
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Copy ALL the code below.
-- 2. Go to your Supabase Dashboard -> SQL Editor (left sidebar).
-- 3. Paste the code and click "RUN".
-- ==============================================================================

BEGIN;

-- 1. ENABLE PUBLIC ACCESS (Fixes Website 404)
-- This allows anyone to view your restaurant page without logging in.
DROP POLICY IF EXISTS "Public Read Access" ON restaurants;
CREATE POLICY "Public Read Access" ON restaurants 
FOR SELECT 
TO public 
USING (true);

-- 2. ENABLE OWNER UPDATES (Fixes Dashboard Save Error)
-- This allows you (the authenticated owner) to update your restaurant settings.
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

-- ✅ SCRIPT COMPLETED. You can now save your settings and view your site!
