-- BIG UPGRADE: Advanced Branding, SEO, and Analytics Schema
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS brand_story TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- Update profiles to include phone number if missing
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT;
