
-- 🕵️ SECURITY AUDIT REPORT 🕵️
-- Run this script to verify your system is secure.
-- It checks if Row Level Security (RLS) is active on your critical tables.

WITH TableSecurity AS (
    SELECT 
        tablename,
        rowsecurity
    FROM pg_tables 
    WHERE schemaname = 'public'
)
SELECT 
    tablename as "Table Name",
    CASE 
        WHEN rowsecurity = true THEN '✅ SECURE (RLS ACTIVE)' 
        ELSE '❌ VULNERABLE (NO RLS)' 
    END as "Security Status",
    CASE
        WHEN tablename = 'profiles' AND rowsecurity = true THEN 'User data is isolated.'
        WHEN tablename = 'orders' AND rowsecurity = true THEN 'Financial data is protected.'
        WHEN tablename = 'restaurants' AND rowsecurity = true THEN 'Restaurant details are safe.'
        WHEN tablename = 'menu_items' AND rowsecurity = true THEN 'Menu inventory is locked.'
        WHEN rowsecurity = false THEN '⚠️ IMMEDIATE ACTION REQUIRED: Enable RLS on this table.'
        ELSE 'Secured.'
    END as "Audit Message"
FROM TableSecurity
WHERE tablename IN ('profiles', 'restaurants', 'menu_items', 'orders', 'order_items', 'categories');

-- Expected Result:
-- All tables should show "✅ SECURE".
-- If you see any "❌ VULNERABLE", run the SECURITY_LOCKDOWN.sql script again.
