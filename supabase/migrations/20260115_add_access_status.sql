-- =============================================
-- USER ACCESS CONTROL MIGRATION
-- =============================================

BEGIN;

-- 1. Create access_status enum if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_status') THEN
        CREATE TYPE access_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- 2. Add access_status to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status access_status DEFAULT 'pending';

-- 3. Mark existing users as approved
-- We assume anyone who already has a profile should stay approved
UPDATE profiles 
SET status = 'approved' 
WHERE status = 'pending';

-- 4. Update get_admin_stats to include pending users count if needed
-- (Optional, but helpful for the admin to see at a glance)

COMMIT;
