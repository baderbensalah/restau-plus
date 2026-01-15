-- ==============================================================================
-- 👑 GOD MODE: RLS SECURITY BYPASS 👑
-- ==============================================================================
-- This script fixes the "Silent Persistence Failure" where changes made 
-- by the admin to other users were being blocked by Row Level Security (RLS).
-- ==============================================================================

BEGIN;

-- 1. Ensure RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. DROP OLD RESTRICTIVE POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update everything" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Users can update own details" ON profiles;

-- 3. CREATE NEW GOD-MODE POLICIES

-- Policy: Anyone can view profiles (needed for dashboard and menu)
CREATE POLICY "Allow authenticated read" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Users can update their own profile details
CREATE POLICY "Allow users update own" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Policy: THE GOD MODE BYPASS
-- This allows any user where is_admin() is true to update ANY row in profiles
CREATE POLICY "Allow admins update any" 
ON profiles FOR UPDATE 
TO authenticated 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Policy: Allow admins to delete rows (optional but helpful)
CREATE POLICY "Allow admins delete any" 
ON profiles FOR DELETE 
TO authenticated 
USING (is_admin());


-- 4. FIX RESTAURANT PERMISSIONS
DROP POLICY IF EXISTS "Public Read Access" ON restaurants;
CREATE POLICY "Public Read Access" ON restaurants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can update their restaurant" ON restaurants;
CREATE POLICY "Owners can update their restaurant" ON restaurants FOR UPDATE USING (
  is_admin() OR 
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = restaurants.id
    and profiles.role = 'owner'
  )
);

-- 5. FIX MENU PERMISSIONS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public View" ON menu_items;
CREATE POLICY "Public View" ON menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin/Owner Update" ON menu_items;
CREATE POLICY "Admin/Owner Update" ON menu_items FOR ALL USING (
  is_admin() OR 
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = menu_items.restaurant_id
    and (profiles.role = 'owner' OR profiles.role = 'manager')
  )
);

COMMIT;

-- ✅ SECURITY UPDATED. Admins now have full permission to modify user profiles.
