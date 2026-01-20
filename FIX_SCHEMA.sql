-- RUN THIS SCRIPT TO FIX THE SETTINGS ERROR
-- It adds the missing columns for the new Theme Customization features.

ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#22c55e',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#050505',
ADD COLUMN IF NOT EXISTS foreground_color TEXT DEFAULT '#ffffff';
