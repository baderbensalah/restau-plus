-- FIX SQL: Convert status enum to text to support 'active', 'pending', etc.

-- 1. Drop the functions temporarily to avoid dependency locks
DROP FUNCTION IF EXISTS approve_user(UUID);
DROP FUNCTION IF EXISTS reject_user(UUID);

-- 2. Alter the column to text (This fixes the Enum error)
-- We cast to text to preserve existing data
ALTER TABLE profiles 
ALTER COLUMN status TYPE TEXT USING status::text;

-- 3. Now we can ensure our default and constraints are applied
ALTER TABLE profiles 
ALTER COLUMN status SET DEFAULT 'pending';

-- 4. Re-apply the check constraint (Safe now that it's text)
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE profiles 
ADD CONSTRAINT valid_status 
CHECK (status IN ('active', 'pending', 'rejected', 'banned'));

-- 5. Re-create the Helper Functions
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
