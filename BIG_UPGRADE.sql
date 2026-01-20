-- BIG UPGRADE: Advanced Branding, SEO, and Analytics Schema
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS brand_story TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#22c55e',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#050505',
ADD COLUMN IF NOT EXISTS foreground_color TEXT DEFAULT '#ffffff';

-- Update profiles to include phone number if missing
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT;
