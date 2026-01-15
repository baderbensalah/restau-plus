-- RLS FIX: Ensure Public Read & Owner Update

-- 1. DROP existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Access" ON restaurants;
DROP POLICY IF EXISTS "Public Read Access by Slug" ON restaurants;
DROP POLICY IF EXISTS "Owners can update their restaurant" ON restaurants;
DROP POLICY IF EXISTS "Members can view their restaurant" ON restaurants;

-- 2. CREATE Public Read Policy (Vital for the website to load)
CREATE POLICY "Public Read Access" ON restaurants
FOR SELECT USING (true);

-- 3. CREATE Owner Update Policy
-- Users can update the restaurant if they are the owner (checked via profiles)
CREATE POLICY "Owners can update their restaurant" ON restaurants
FOR UPDATE USING (
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

-- 4. Ensure authenticated users (staff) can view their own restaurant (optional if public read is on, but good for dashboard consistency)
CREATE POLICY "Members can view their restaurant" ON restaurants
FOR SELECT USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = restaurants.id
  )
);
