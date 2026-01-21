-- Enable RLS on categories if not already
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories (so customers can see them)
CREATE POLICY "Public Read Access Categories" ON categories
FOR SELECT USING (true);

-- Allow Owners to Insert/Update/Delete categories
CREATE POLICY "Owners can manage categories" ON categories
FOR ALL USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = categories.restaurant_id
    and profiles.role = 'owner'
  )
)
WITH CHECK (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = categories.restaurant_id
    and profiles.role = 'owner'
  )
);

-- Just in case, ensure menu_items has similar policies
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access Menu Items" ON menu_items
FOR SELECT USING (true);

CREATE POLICY "Owners can manage menu items" ON menu_items
FOR ALL USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = menu_items.restaurant_id
    and profiles.role = 'owner'
  )
)
WITH CHECK (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.restaurant_id = menu_items.restaurant_id
    and profiles.role = 'owner'
  )
);
