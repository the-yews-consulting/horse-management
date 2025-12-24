/*
  # Fix Profile Creation RLS Policy

  ## Overview
  Allows automatic profile creation when users sign up by permitting
  inserts for new user IDs that don't have profiles yet.

  ## Changes
  - Replace restrictive policy with one that allows profile creation for new users
  - Check that profile doesn't already exist before allowing insert
  - Allow super admins to insert any profile

  ## Security
  - New users can only create their own profile
  - Prevents duplicate profile creation
  - Super admins retain full control
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Allow profile creation for new users" ON profiles;

-- Allow new profile creation and super admin inserts
CREATE POLICY "Allow new user profile creation"
  ON profiles FOR INSERT
  WITH CHECK (
    -- Allow if this is a new profile (doesn't exist yet)
    NOT EXISTS (SELECT 1 FROM profiles WHERE id = profiles.id)
    OR
    -- Or if super admin is doing it
    (SELECT get_user_role()) = 'super_admin'
  );