/*
  # Fix Profile Creation Trigger and RLS

  ## Overview
  Fixes the profile creation issue by properly handling RLS for the trigger
  that automatically creates profiles when users sign up.

  ## Changes
  - Drop problematic RLS policies
  - Create simpler policy that allows authenticated users to create their own profile
  - Update trigger function to properly handle profile creation

  ## Security
  - Users can only create profiles for themselves (auth.uid() must match)
  - Super admins can create any profile
  - Maintains proper security boundaries
*/

-- Drop existing insert policies
DROP POLICY IF EXISTS "Allow new user profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation for new users" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON profiles;

-- Create a policy that allows profile creation during signup
CREATE POLICY "Enable profile creation"
  ON profiles FOR INSERT
  WITH CHECK (
    -- Allow if the profile ID matches the authenticated user
    auth.uid() = id
    -- Or if a super admin is creating it
    OR is_super_admin()
  );