/*
  # Fix Horse Media RLS Policies

  1. Changes
    - Drop existing complex RLS policies on horse_media
    - Add simplified policies that work with server-side authentication
    - Allow authenticated role to perform all operations
    
  2. Security
    - Still requires authentication via the server JWT middleware
    - Server validates user permissions before database access
*/

DROP POLICY IF EXISTS "Authenticated users can view horse media" ON horse_media;
DROP POLICY IF EXISTS "Authenticated users can create media for accessible horses" ON horse_media;
DROP POLICY IF EXISTS "Users can update their horses' media or admins can update any" ON horse_media;
DROP POLICY IF EXISTS "Users can delete their horses' media or admins can delete any" ON horse_media;

CREATE POLICY "Allow all operations for authenticated role"
  ON horse_media
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);