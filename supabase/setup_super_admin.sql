-- Ensure the admin role exists
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- This script should be run in the Supabase SQL Editor
-- It ensures that if 'admin@restauplus.com' signs up, they get the 'admin' role automatically.

CREATE OR REPLACE FUNCTION public.handle_admin_role_elevation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'admin@restauplus.com' THEN
    UPDATE public.profiles SET role = 'admin', status = 'approved' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to elevate role on profile creation/update
DROP TRIGGER IF EXISTS on_auth_user_admin_check ON public.profiles;
CREATE TRIGGER on_auth_user_admin_check
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_role_elevation();

-- Force update if user already exists
UPDATE public.profiles 
SET role = 'admin', status = 'approved' 
WHERE email = 'admin@restauplus.com';
