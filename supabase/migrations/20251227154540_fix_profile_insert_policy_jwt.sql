/*
  # Fix Profile INSERT Policy to Use JWT Claims
  
  ## Problem
  
  The INSERT policy "Allow profile creation for new users and super admins"
  uses the is_super_admin() function which queries the profiles table,
  causing infinite recursion.
  
  ## Solution
  
  Replace the function call with direct JWT claim checking.
  
  ## Changes
  
  - Drop the problematic INSERT policy
  - Create new INSERT policy using JWT claims
*/

-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Allow profile creation for new users and super admins" ON profiles;

-- Allow profile creation for new users and super admins (using JWT claims)
CREATE POLICY "Allow profile creation for self and super admins"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id 
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );
