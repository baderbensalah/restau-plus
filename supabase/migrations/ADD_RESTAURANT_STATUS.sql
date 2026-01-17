-- Add is_active column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Update RLS to ensure Owners can only access if active? 
-- Actually, we might want Owners to see a "Suspended" screen instead of being blocked entirely.
-- For now, we just add the column. The logic will be handled in the application layer (AccessGuard).
