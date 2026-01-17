-- 1. Enable Admin Check
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Allow Admins to VIEW (SELECT) Everything
-- Using is_admin() only. No "owner_id" column exists on restaurants.
CREATE POLICY "Admins can view any profile" ON public.profiles FOR SELECT TO authenticated USING ( is_admin() OR auth.uid() = id );

DROP POLICY IF EXISTS "Admins can view any restaurant" ON public.restaurants;
CREATE POLICY "Admins can view any restaurant" ON public.restaurants FOR SELECT TO authenticated USING ( is_admin() );

-- 3. Allow Admins to INSERT
DROP POLICY IF EXISTS "Admins can insert restaurants" ON public.restaurants;
CREATE POLICY "Admins can insert restaurants" ON public.restaurants FOR INSERT TO authenticated WITH CHECK ( is_admin() );

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK ( is_admin() );

-- 4. Allow Admins to UPDATE
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING ( is_admin() OR auth.uid() = id );

DROP POLICY IF EXISTS "Admins can update any restaurant" ON public.restaurants;
CREATE POLICY "Admins can update any restaurant" ON public.restaurants FOR UPDATE TO authenticated USING ( is_admin() );

-- 5. Fix Column Existence (Safe Check)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'is_active') THEN
        ALTER TABLE public.restaurants ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;
