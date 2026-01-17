-- DEFINITIVE FIX: Force Convert to Text FIRST, then fix data.

-- 1. Remove any defaults to unlock the column
ALTER TABLE profiles ALTER COLUMN status DROP DEFAULT;

-- 2. FORCE convert the column to TEXT. 
-- This breaks the link to the "access_status" enum and allows any string.
ALTER TABLE profiles 
ALTER COLUMN status TYPE TEXT USING status::text;

-- 3. Update existing data (Now safe because it's just text)
UPDATE profiles 
SET status = 'active' 
WHERE status IS NULL 
   OR status NOT IN ('active', 'pending', 'rejected', 'banned');

-- 4. Set the new default
ALTER TABLE profiles 
ALTER COLUMN status SET DEFAULT 'pending';

-- 5. Apply the strict check constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE profiles 
ADD CONSTRAINT valid_status 
CHECK (status IN ('active', 'pending', 'rejected', 'banned'));

-- 6. Clean up the old enum type if it's no longer used (Optional, but good for hygiene)
-- DROP TYPE IF EXISTS access_status; 
