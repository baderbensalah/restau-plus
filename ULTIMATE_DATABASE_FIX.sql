-- ULTIMATE DATABASE FIX: Schema, Columns, and RLS Permissions
-- This script fixes ALL known issues with ordering, settings, and table display.

-- 1. ENSURE ALL COLUMNS EXIST IN RESTAURANTS TABLE
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email_public TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- 2. ENSURE ALL COLUMNS EXIST IN ORDERS TABLE
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS table_number TEXT;

-- 3. FIX RLS POLICIES FOR RESTAURANTS (Allow Managers to Update)
DROP POLICY IF EXISTS "Owners can update their restaurant" ON restaurants;
DROP POLICY IF EXISTS "Owners and Managers can update their restaurant" ON restaurants;

CREATE POLICY "Owners and Managers can update their restaurant" ON restaurants
FOR UPDATE USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = restaurants.id
    and profiles.role IN ('owner', 'manager')
  )
);

-- 4. FIX RLS POLICIES FOR ORDERS (Allow Public Order Placement)
-- Allow anyone to place an order (essential for the public menu)
DROP POLICY IF EXISTS "Allow anonymous order insertion" ON orders;
DROP POLICY IF EXISTS "Isolate orders" ON orders;

CREATE POLICY "Allow public order insertion" ON orders
FOR INSERT WITH CHECK (true);

-- Allow restaurant members to view and update orders
CREATE POLICY "Members can view their restaurant orders" ON orders
FOR SELECT USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = orders.restaurant_id
  )
);

CREATE POLICY "Members can update their restaurant orders" ON orders
FOR UPDATE USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = orders.restaurant_id
  )
);

-- 5. FIX RLS POLICIES FOR ORDER_ITEMS (Allow Public Order Placement)
DROP POLICY IF EXISTS "Isolate order items" ON order_items;

CREATE POLICY "Allow public order_items insertion" ON order_items
FOR INSERT WITH CHECK (true);

CREATE POLICY "Members can view their restaurant order_items" ON order_items
FOR SELECT USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = order_items.restaurant_id
  )
);

-- 6. ENSURE STORAGE POLICIES ARE IN PLACE
INSERT INTO storage.buckets (id, name, public) 
VALUES ('restaurant-assets', 'restaurant-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'restaurant-assets');

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');
