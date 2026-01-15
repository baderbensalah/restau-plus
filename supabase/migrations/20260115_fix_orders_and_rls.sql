-- Migration: 20260115_fix_orders_and_rls.sql

-- 1. Add direct info columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS table_number TEXT;

-- 2. Update RLS Policy for Restaurants to include managers
-- Drop old policy
DROP POLICY IF EXISTS "Owners can update their restaurant" ON restaurants;

-- Create new inclusive policy
CREATE POLICY "Owners and Managers can update their restaurant" ON restaurants
FOR UPDATE USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = restaurants.id
    and profiles.role IN ('owner', 'manager')
  )
)
WITH CHECK (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = restaurants.id
    and profiles.role IN ('owner', 'manager')
  )
);
