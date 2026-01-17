-- FIX SQL: Clean data before applying constraints

-- 1. Update any existing rows with NULL or invalid status to 'active' 
-- This ensures existing users don't get locked out and the constraint can be applied.
UPDATE profiles 
SET status = 'active' 
WHERE status IS NULL 
   OR status NOT IN ('active', 'pending', 'rejected', 'banned');

-- 2. Now that data is clean, add the constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE profiles 
ADD CONSTRAINT valid_status 
CHECK (status IN ('active', 'pending', 'rejected', 'banned'));

-- 3. Ensure NEW users default to 'pending'
ALTER TABLE profiles 
ALTER COLUMN status SET DEFAULT 'pending';

-- 4. Re-verify functions exist
CREATE OR REPLACE FUNCTION approve_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET status = 'active' 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET status = 'rejected' 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
