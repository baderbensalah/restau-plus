-- Allow users to view their own profile without relying on restaurant_id
CREATE POLICY "View own profile" ON profiles
  FOR SELECT USING (
    id = auth.uid()
  );

-- Fix restaurants update policy to be more robust
DROP POLICY IF EXISTS "Owners can update their restaurant" ON restaurants;

CREATE POLICY "Owners can update their restaurant" ON restaurants
  FOR UPDATE USING (
    id IN (SELECT restaurant_id FROM profiles WHERE id = auth.uid() AND role = 'owner')
  )
  WITH CHECK (
    id IN (SELECT restaurant_id FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );
