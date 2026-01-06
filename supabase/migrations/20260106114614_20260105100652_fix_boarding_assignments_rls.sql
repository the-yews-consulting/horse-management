/*
  # Fix Boarding Assignments RLS Policies
  
  1. Changes
    - Simplify boarding assignments RLS policies
    - Allow all authenticated operations
    - Backend handles authorization
  
  2. Security
    - Backend validates permissions through middleware
    - RLS provides basic authenticated-only access
*/

-- Drop restrictive policies
DROP POLICY IF EXISTS "Users can create boarding assignments for their horses or admin" ON boarding_assignments;
DROP POLICY IF EXISTS "Users can update their boarding assignments or admins can updat" ON boarding_assignments;
DROP POLICY IF EXISTS "Users can delete their boarding assignments or super admins can" ON boarding_assignments;

-- Create simpler policies
CREATE POLICY "Authenticated users can create boarding assignments"
  ON boarding_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update boarding assignments"
  ON boarding_assignments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete boarding assignments"
  ON boarding_assignments FOR DELETE
  TO authenticated
  USING (true);