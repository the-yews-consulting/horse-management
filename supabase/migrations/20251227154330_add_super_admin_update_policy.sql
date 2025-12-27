/*
  # Add Super Admin Update Policy for Profiles
  
  ## Problem
  
  Super admins cannot update other users' profiles because the current
  UPDATE policy only allows users to update their own profile.
  
  ## Solution
  
  Add a policy that allows super admins to update any profile, while
  keeping the existing policy that allows users to update their own.
  
  ## Changes
  
  - Add UPDATE policy for super admins to update any profile
  - Keep existing user self-update policy
*/

-- Allow super admins to update any profile
CREATE POLICY "super_admins_update_any_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin'
    )
  );

-- Also allow super admins to read all profiles
CREATE POLICY "super_admins_select_all_profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin'
    )
  );
