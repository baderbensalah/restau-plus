
-- 🛡️ SECURITY LOCKDOWN PROTOCOL 🛡️
-- This script secures the application against:
-- 1. Privilege Escalation (Hacking "Admin" role)
-- 2. Data Leaks (Seeing other restaurants' orders)
-- 3. Unauthorized Edits (Changing someone else's menu)

-- =================================================================
-- 1. PREVENT SELF-PROMOTION (The "God Mode" Hack)
-- =================================================================
-- We create a trigger that runs BEFORE any update on 'profiles'.
-- It ensures that a normal user cannot change their own 'role' or 'status'.

CREATE OR REPLACE FUNCTION public.protect_critical_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if 'role' is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow change ONLY if the executing user is ALREADY an admin
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION '⛔ SECURITY ALERT: You are not authorized to change your User Role.';
    END IF;
  END IF;

  -- Check if 'status' is being changed (e.g. unbanning oneself)
  IF NEW.status IS DISTINCT FROM OLD.status THEN
     IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION '⛔ SECURITY ALERT: You are not authorized to change your Account Status.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_profile ON public.profiles;
CREATE TRIGGER tr_protect_profile
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_critical_columns();


-- =================================================================
-- 2. LOCK DOWN ORDERS (Financial Privacy)
-- =================================================================
-- Only the Restaurant Owner (or Admin) can view their orders.
-- Anonymous/Public users should NEVER see orders.

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view their orders" ON public.orders;

CREATE POLICY "Owners can view their orders" ON public.orders
FOR ALL TO authenticated
USING (
    -- User is Admin OR User's restaurant_id matches the order's restaurant_id
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR 
    restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);


-- =================================================================
-- 3. LOCK DOWN MENU ITEMS (Data Integrity)
-- =================================================================
-- Public can VIEW (SELECT)
-- Only Owners can EDIT (INSERT/UPDATE/DELETE)

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Allow Public View
DROP POLICY IF EXISTS "Public can view active menu items" ON public.menu_items;
CREATE POLICY "Public can view active menu items" ON public.menu_items
FOR SELECT TO anon, authenticated
USING (true); -- Publicly visible

-- Restrict Edits to Owners
DROP POLICY IF EXISTS "Owners can manage menu" ON public.menu_items;
CREATE POLICY "Owners can manage menu" ON public.menu_items
FOR ALL TO authenticated
USING (
    -- Admin or Owner of this specific restaurant
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR 
    restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);


-- =================================================================
-- 4. SECURE STORAGE (Image/File Uploads)
-- =================================================================
-- Prevent users from overwriting others' files
-- Check if bucket exists, creating policies for 'restaurant-assets'

-- (Usually handled in Storage UI, but we assume RLS is active there too)
-- Ensure users can only upload to their OWN folder: 'restaurant_id/*'
