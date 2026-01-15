-- ==============================================================================
-- 🚀 THE DEFINITIVE SYSTEM REPAIR SCRIPT 🚀
-- ==============================================================================
-- This script fixes the "Update Failed: {}" issue by:
-- 1. Ensuring the 'description' and all other missing columns exist.
-- 2. Ensuring yours (the current user) is set as the 'owner' of your restaurant.
-- 3. Fixing RLS permissions to allow the update.
-- ==============================================================================

BEGIN;

-- 1. ADD MISSING COLUMNS (Ensures Supabase knows about these fields)
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#000000';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#ffffff';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS email_public TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS website_url TEXT;

-- 2. ENSURE YOU ARE THE OWNER
-- This finds the profile associated with your login and makes sure it's an 'owner'.
-- Without this, the RLS policy will block you from saving changes.
UPDATE profiles 
SET role = 'owner' 
WHERE id = auth.uid();

-- 3. FIX RLS POLICIES
-- Grant public read access (for the website)
DROP POLICY IF EXISTS "Public Read Access" ON restaurants;
CREATE POLICY "Public Read Access" ON restaurants 
FOR SELECT 
TO public 
USING (true);

-- Grant update access to the owner (for the dashboard)
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

-- ✅ SYSTEM REPAIRED. Try saving your description now!
