-- 1. Update the global is_admin() helper function
-- This ensures RLS policies (Restaurants, Profiles, Orders, Subscriptions) work for the super-admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND (role = 'admin' OR email = 'admin@restauplus.com')
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- 2. Update the get_admin_stats() RPC function
-- This ensures the dashboard stats (Revenue, Charts, Globe) populate for the super-admin
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  total_restaurants INTEGER;
  total_clients INTEGER;
  total_revenue NUMERIC;
  active_subs_count INTEGER;
  total_subs_count INTEGER;
  active_subs_percentage INTEGER;
  pending_setup_count INTEGER;
  revenue_history JSON;
  map_locations JSON;
  is_admin_check BOOLEAN;
BEGIN
  -- Security Check (Updated to include email bypass)
  SELECT is_admin() INTO is_admin_check;
  IF NOT is_admin_check THEN
     RETURN json_build_object('error', 'Access Denied');
  END IF;

  -- Basic Counts
  SELECT COUNT(*) INTO total_restaurants FROM restaurants;
  SELECT COUNT(*) INTO total_clients FROM profiles WHERE role = 'owner';

  -- Subscription Stats
  SELECT COUNT(*) INTO total_subs_count FROM subscriptions;
  SELECT COUNT(*) INTO active_subs_count FROM subscriptions WHERE status = 'active';
  
  IF total_subs_count > 0 THEN
    active_subs_percentage := (active_subs_count::decimal / total_subs_count::decimal) * 100;
  ELSE
    active_subs_percentage := 0;
  END IF;

  -- "Pending Setup": Restaurants that have 0 menu items
  SELECT COUNT(*) INTO pending_setup_count 
  FROM restaurants r
  WHERE NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = r.id);

  -- Total Platform Revenue
  SELECT COALESCE(SUM(total_amount), 0) INTO total_revenue FROM orders WHERE status != 'cancelled';

  -- Revenue History (Last 7 Days)
  SELECT json_agg(t) INTO revenue_history FROM (
    SELECT 
      to_char(date_trunc('day', created_at), 'Mon DD') as name,
      COALESCE(SUM(total_amount), 0) as total
    FROM orders
    WHERE created_at > now() - INTERVAL '7 days' AND status != 'cancelled'
    GROUP BY 1
    ORDER BY MIN(created_at)
  ) t;

  -- Globe Locations
  SELECT json_agg(l) INTO map_locations FROM (
    SELECT latitude, longitude, name FROM restaurants
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    LIMIT 100
  ) l;

  RETURN json_build_object(
    'total_restaurants', total_restaurants,
    'total_clients', total_clients,
    'total_revenue', total_revenue,
    'active_subs_percentage', active_subs_percentage,
    'pending_setup_count', pending_setup_count,
    'revenue_history', COALESCE(revenue_history, '[]'::json),
    'map_locations', COALESCE(map_locations, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 3. Ensure the current user is promoted if they switched roles
UPDATE profiles 
SET role = 'admin', status = 'approved' 
WHERE email = 'admin@restauplus.com';
