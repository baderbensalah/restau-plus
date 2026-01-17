-- 1. Add status column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 2. Add constraint to ensure valid status values
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE profiles 
ADD CONSTRAINT valid_status 
CHECK (status IN ('active', 'pending', 'rejected', 'banned'));

-- 3. Update RLS Policies to allow Admin to manage everything
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR 
    auth.jwt() ->> 'email' = 'admin@restauplus.com'
  );

-- 4. Ensure Admins can VIEW all profiles (already covered by "View team members" usually, but let's be explicit)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR 
    auth.jwt() ->> 'email' = 'admin@restauplus.com'
  );

-- 5. Fix implicit "owner" setup for new users (Ensure first user doesn't get locked out if you want)
-- For this "Pro" request, we assume new users ARE locked out until approved.

-- 6. Helper function to approve user safely
CREATE OR REPLACE FUNCTION approve_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET status = 'active' 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Helper function to reject user
CREATE OR REPLACE FUNCTION reject_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET status = 'rejected' 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
