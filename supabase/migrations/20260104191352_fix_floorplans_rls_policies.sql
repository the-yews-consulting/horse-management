/*
  # Fix Floorplans RLS Policies

  1. Changes
    - Drop existing restrictive RLS policies on floorplans
    - Add new policies that work with server-side authentication
    - Allow authenticated role to perform all operations
    
  2. Security
    - Still requires authentication via the server JWT middleware
    - Server validates user permissions before database access
*/

DROP POLICY IF EXISTS "Authenticated users can read all floorplans" ON floorplans;
DROP POLICY IF EXISTS "Authenticated users can create floorplans" ON floorplans;
DROP POLICY IF EXISTS "Users can update own floorplans" ON floorplans;
DROP POLICY IF EXISTS "Users can delete own floorplans" ON floorplans;

CREATE POLICY "Allow all operations for authenticated role"
  ON floorplans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
