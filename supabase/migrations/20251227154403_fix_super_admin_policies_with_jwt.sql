/*
  # Fix Super Admin Policies Using JWT Claims
  
  ## Problem
  
  The helper functions (is_super_admin, is_admin_or_higher) query the profiles
  table, causing infinite recursion when used in profiles table policies.
  
  ## Solution
  
  Use JWT claims instead of querying the profiles table. The custom-access-token
  edge function already adds user_role to the JWT, so we can read it directly
  without causing recursion.
  
  ## Changes
  
  - Drop policies that use helper functions
  - Create new policies that read from JWT claims
  - Super admins can read and update any profile
  - Users can read and update their own profile
*/

-- Drop the problematic policies
DROP POLICY IF EXISTS "super_admins_update_any_profile" ON profiles;
DROP POLICY IF EXISTS "super_admins_select_all_profiles" ON profiles;

-- Allow super admins to read all profiles (using JWT claims)
CREATE POLICY "super_admins_read_all_profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'user_role')::text = 'super_admin'
    OR auth.uid() = id
  );

-- Allow super admins to update any profile (using JWT claims)
CREATE POLICY "super_admins_update_all_profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->>'user_role')::text = 'super_admin'
    OR auth.uid() = id
  )
  WITH CHECK (
    (auth.jwt()->>'user_role')::text = 'super_admin'
    OR auth.uid() = id
  );

-- Drop the old simple policies since we now have combined ones
DROP POLICY IF EXISTS "users_select_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
