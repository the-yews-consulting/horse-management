/*
  # Create Floorplans Table

  1. New Tables
    - `floorplans`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the floorplan
      - `description` (text) - Optional description
      - `layout_data` (jsonb) - Stores the floorplan items as JSON
      - `created_by` (uuid) - References auth.users
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `floorplans` table
    - Add policy for authenticated users to read all floorplans
    - Add policy for authenticated users to create floorplans
    - Add policy for users to update their own floorplans
    - Add policy for users to delete their own floorplans

  3. Indexes
    - Add index on created_by for faster queries
*/

CREATE TABLE IF NOT EXISTS floorplans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  layout_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE floorplans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all floorplans"
  ON floorplans
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create floorplans"
  ON floorplans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own floorplans"
  ON floorplans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own floorplans"
  ON floorplans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_floorplans_created_by ON floorplans(created_by);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_floorplans_updated_at
  BEFORE UPDATE ON floorplans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();