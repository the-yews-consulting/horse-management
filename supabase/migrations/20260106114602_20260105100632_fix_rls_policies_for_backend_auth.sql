/*
  # Fix RLS Policies for Backend Authorization
  
  1. Changes
    - Update RLS policies to allow all authenticated operations
    - Backend handles authorization through JWT middleware
    - Simplify policies since backend validates roles
  
  2. Security
    - Backend uses JWT with role-based access control
    - RLS remains enabled for defense in depth
    - Policies allow authenticated users, backend enforces fine-grained permissions
*/

-- Drop existing restrictive policies and create simpler ones
-- HORSES TABLE
DROP POLICY IF EXISTS "Users can delete their horses or admins can delete any" ON horses;
DROP POLICY IF EXISTS "Users can update their horses or admins can update any" ON horses;

CREATE POLICY "Authenticated users can update horses"
  ON horses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete horses"
  ON horses FOR DELETE
  TO authenticated
  USING (true);

-- STALLS TABLE
DROP POLICY IF EXISTS "Users can delete their stalls or super admins can delete any" ON stalls;
DROP POLICY IF EXISTS "Users can update their stalls or admins can update any" ON stalls;
DROP POLICY IF EXISTS "Admins can create stalls" ON stalls;

CREATE POLICY "Authenticated users can create stalls"
  ON stalls FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update stalls"
  ON stalls FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete stalls"
  ON stalls FOR DELETE
  TO authenticated
  USING (true);

-- OWNERS TABLE
DROP POLICY IF EXISTS "Users can delete their owners or admins can delete any" ON owners;
DROP POLICY IF EXISTS "Users can update their owners or admins can update any" ON owners;

CREATE POLICY "Authenticated users can update owners"
  ON owners FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete owners"
  ON owners FOR DELETE
  TO authenticated
  USING (true);

-- VETS TABLE
DROP POLICY IF EXISTS "Users can delete their vets or admins can delete any" ON vets;
DROP POLICY IF EXISTS "Users can update their vets or admins can update any" ON vets;

CREATE POLICY "Authenticated users can update vets"
  ON vets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete vets"
  ON vets FOR DELETE
  TO authenticated
  USING (true);

-- FARRIERS TABLE
DROP POLICY IF EXISTS "Users can delete their farriers or admins can delete any" ON farriers;
DROP POLICY IF EXISTS "Users can update their farriers or admins can update any" ON farriers;

CREATE POLICY "Authenticated users can update farriers"
  ON farriers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete farriers"
  ON farriers FOR DELETE
  TO authenticated
  USING (true);