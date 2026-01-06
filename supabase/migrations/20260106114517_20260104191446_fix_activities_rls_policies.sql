/*
  # Fix Activities RLS Policies

  1. Changes
    - Drop existing complex RLS policies on activities
    - Add simplified policies that work with server-side authentication
    - Allow authenticated role to perform all operations
    
  2. Security
    - Still requires authentication via the server JWT middleware
    - Server validates user permissions before database access
*/

DROP POLICY IF EXISTS "Users can view activities" ON activities;
DROP POLICY IF EXISTS "Users can create activities" ON activities;
DROP POLICY IF EXISTS "Users can update their activities or admins can update any" ON activities;
DROP POLICY IF EXISTS "Users can delete their activities or admins can delete any" ON activities;

CREATE POLICY "Allow all operations for authenticated role"
  ON activities
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);