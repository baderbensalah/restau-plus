-- Update the current user's profile to be an 'owner'
-- This ensures they pass the RLS policy for updating the restaurant.
UPDATE profiles
SET role = 'owner'
WHERE id = auth.uid();
