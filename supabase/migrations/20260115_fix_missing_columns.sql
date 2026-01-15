-- Add missing branding columns to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Ensure slug is unique if it wasn't already
-- (If you get an error that slug exists, you can ignore the line above)
