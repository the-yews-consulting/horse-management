/*
  # Add Admin Profile Management Policies

  ## Changes
  
  This migration adds RLS policies to allow both admin and super_admin roles
  to manage user profiles (view and update).

  1. Security Updates
    - Add policy for admins to update user profiles
    - Maintain existing super_admin policies
    - Both admin and super_admin can now edit user accounts

  ## Notes
  
  - Users must log out and log back in for JWT claims to include their role
  - The custom-access-token hook must be configured in Supabase dashboard
*/

-- Drop existing update policy to recreate with admin support
DROP POLICY IF EXISTS "super_admins_update_all_profiles" ON profiles;

-- Allow both super admins and admins to update any profile
CREATE POLICY "admins_and_super_admins_update_all_profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->>'user_role')::text IN ('super_admin', 'admin')
    OR auth.uid() = id
  )
  WITH CHECK (
    (auth.jwt()->>'user_role')::text IN ('super_admin', 'admin')
    OR auth.uid() = id
  );

-- Drop existing read policy to recreate with admin support
DROP POLICY IF EXISTS "super_admins_read_all_profiles" ON profiles;

-- Allow both super admins and admins to read all profiles
CREATE POLICY "admins_and_super_admins_read_all_profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'user_role')::text IN ('super_admin', 'admin')
    OR auth.uid() = id
  );

-- Allow admins and super admins to insert profiles for other users
DROP POLICY IF EXISTS "Allow profile creation for self and super admins" ON profiles;

CREATE POLICY "Allow profile creation for self and admins"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id 
    OR (auth.jwt()->>'user_role')::text IN ('super_admin', 'admin')
  );
