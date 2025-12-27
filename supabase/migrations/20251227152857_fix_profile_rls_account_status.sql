/*
  # Fix Profile RLS Policies for Account Status
  
  ## Changes
  
  1. Remove account_status check from basic profile read policies
    - Users must be able to read their own profile regardless of status
    - Application code handles access control based on status
    - RLS only ensures data isolation (users can only see their own data)
  
  2. Keep account_status checks for admin policies
    - Only enabled admins can view/update other profiles
  
  ## Security Notes
  
  - Users can always read their own profile (needed for login flow)
  - Application blocks access based on account_status in AuthContext
  - Admins must be enabled to manage other users
*/

-- Drop the restrictive policies
DROP POLICY IF EXISTS "Enabled users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Enabled users can update own profile" ON profiles;

-- Users can always read their own profile (status check happens in app)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (but not role or account_status)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM profiles WHERE id = auth.uid()) AND
    account_status = (SELECT account_status FROM profiles WHERE id = auth.uid())
  );
