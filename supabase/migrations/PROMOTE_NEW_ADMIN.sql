-- Promote the specific user to admin if they exist
UPDATE public.profiles
SET role = 'admin',
    status = 'active'
WHERE email = 'admin212123@restauplus.com';

-- Just in case, ensure RLS lets them do everything (Safety net)
-- The RLS policies already use proper role checks, so this update is sufficient.
