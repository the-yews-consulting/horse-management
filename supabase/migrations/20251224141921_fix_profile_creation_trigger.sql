/*
  # Fix Profile Creation Trigger

  ## Overview
  Fixes the issue where new user registration fails because the trigger
  cannot create profiles due to RLS policies blocking the insert.

  ## Changes
  - Add RLS policy to allow system/trigger to create profiles for new users
  - This policy checks that the authenticated user ID matches the profile being created
  - Allows the handle_new_user() trigger to successfully create profiles

  ## Security
  - Policy ensures users can only have a profile created for their own ID
  - Maintains security while allowing automatic profile creation
*/

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Super admins can insert profiles" ON profiles;

-- Allow profile creation for new users (used by trigger and super admins)
CREATE POLICY "Allow profile creation for new users"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id OR is_super_admin()
  );