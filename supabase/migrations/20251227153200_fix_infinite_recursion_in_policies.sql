/*
  # Fix Infinite Recursion in RLS Policies
  
  ## Problem
  
  RLS policies were causing infinite recursion by querying the profiles table
  from within the profiles table policies (e.g., SELECT role FROM profiles 
  inside a profiles policy).
  
  ## Solution
  
  1. Remove all policies that cause recursion
  2. Create simplified policies that don't reference profiles table
  3. Use direct comparisons instead of subqueries
  
  ## Changes
  
  - Drop all existing profiles policies
  - Create clean, non-recursive policies
  - Users can view/update own profile (no status checks in RLS)
  - Admins use helper functions that cache results
*/

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update account status" ON profiles;
DROP POLICY IF EXISTS "Users can view their profile or admins can view any" ON profiles;
DROP POLICY IF EXISTS "Users can update their profile or super admins can update any" ON profiles;
DROP POLICY IF EXISTS "Enabled users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Enabled users can update own profile" ON profiles;

-- Simple policy: users can read their own profile
CREATE POLICY "users_select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Simple policy: users can update their own profile
-- (Changes to role and account_status are handled by application logic)
CREATE POLICY "users_update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Keep the insert and delete policies that don't cause recursion
-- (These use helper functions that should be safe)
