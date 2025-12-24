/*
  # Fix Duplicate Profile Anon Policies

  ## Overview
  Consolidates duplicate anon INSERT policies on profiles table
  by properly scoping policies to specific roles.

  ## Changes
  - Update authenticated policy to only apply to authenticated role
  - Keep separate anon/service_role policy for auth trigger

  ## Security
  - Maintains all existing access controls
  - Properly separates anon and authenticated INSERT policies
  - No changes to security model
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow profile creation for new users and super admins" ON profiles;
DROP POLICY IF EXISTS "Allow anon profile creation for auth trigger" ON profiles;

-- Create policy for authenticated users only
CREATE POLICY "Allow profile creation for new users and super admins"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id OR is_super_admin());

-- Create separate policy for anon/service_role (for auth triggers)
CREATE POLICY "Allow anon profile creation for auth trigger"
  ON profiles FOR INSERT
  TO anon, service_role
  WITH CHECK (true);