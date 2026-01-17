-- FIX RLS: Allow users to ALWAYS see their own profile.
-- This is critical for reading 'role' during login/redirection.

CREATE POLICY "View own profile" ON profiles
  FOR SELECT USING (
    id = auth.uid()
  );
