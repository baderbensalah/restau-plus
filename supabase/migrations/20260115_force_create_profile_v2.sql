-- DANGEROUS: Temporarily disable RLS to force insert
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 1. Ensure a Restaurant exists
WITH inserted_restaurant AS (
  INSERT INTO restaurants (name, slug)
  VALUES ('My Restaurant', 'my-restaurant-' || substring(uuid_generate_v4()::text from 1 for 6))
  ON CONFLICT DO NOTHING
  RETURNING id
),
target_restaurant AS (
  SELECT id FROM inserted_restaurant
  UNION ALL
  SELECT id FROM restaurants LIMIT 1
)
-- 2. Insert the Profile for your User ID
INSERT INTO profiles (id, email, full_name, role, restaurant_id)
SELECT 
  '2c264297-5394-4b4b-8078-c70beaac0a9c', -- YOUR UUID
  'owner@example.com',                    -- Dummy email
  'Restaurant Owner',
  'owner',
  (SELECT id FROM target_restaurant LIMIT 1)
ON CONFLICT (id) DO UPDATE
SET role = 'owner';

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
