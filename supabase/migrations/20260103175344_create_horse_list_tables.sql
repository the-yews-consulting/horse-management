/*
  # Create Horse List Tables
  
  1. New Tables
    - `horse_breeds`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Full breed name
      - `abbreviation` (text) - Short code for the breed
      - `is_default` (boolean) - Whether this is the default selection
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `horse_colours`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Colour name
      - `abbreviation` (text) - Short code
      - `is_default` (boolean) - Whether this is the default selection
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `horse_genders`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Gender name
      - `abbreviation` (text) - Short code
      - `is_default` (boolean) - Whether this is the default selection
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read
    - Add policies for admin users to manage entries
  
  3. Initial Data
    - Populate tables with default values for breeds, colours, and genders
*/

-- Create horse_breeds table
CREATE TABLE IF NOT EXISTS horse_breeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  abbreviation text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create horse_colours table
CREATE TABLE IF NOT EXISTS horse_colours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  abbreviation text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create horse_genders table
CREATE TABLE IF NOT EXISTS horse_genders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  abbreviation text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE horse_breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE horse_colours ENABLE ROW LEVEL SECURITY;
ALTER TABLE horse_genders ENABLE ROW LEVEL SECURITY;

-- Policies for horse_breeds
CREATE POLICY "Anyone can view horse breeds"
  ON horse_breeds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert horse breeds"
  ON horse_breeds FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update horse breeds"
  ON horse_breeds FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete horse breeds"
  ON horse_breeds FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policies for horse_colours
CREATE POLICY "Anyone can view horse colours"
  ON horse_colours FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert horse colours"
  ON horse_colours FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update horse colours"
  ON horse_colours FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete horse colours"
  ON horse_colours FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policies for horse_genders
CREATE POLICY "Anyone can view horse genders"
  ON horse_genders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert horse genders"
  ON horse_genders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update horse genders"
  ON horse_genders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete horse genders"
  ON horse_genders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Insert default breeds
INSERT INTO horse_breeds (name, abbreviation, is_default) VALUES
  ('Pony', 'PNY', false),
  ('Purebred Arabian', 'PA', false),
  ('Quarter Horse', 'QTR', false),
  ('Standardbred', 'STD', false),
  ('Thoroughbred', 'TB', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default colours
INSERT INTO horse_colours (name, abbreviation, is_default) VALUES
  ('Brown', 'BR', false),
  ('Bay', 'BAY', true),
  ('Chesnut', 'CH', false),
  ('Grey', 'GR', false),
  ('Black', 'BL', false)
ON CONFLICT (name) DO NOTHING;

-- Insert default genders
INSERT INTO horse_genders (name, abbreviation, is_default) VALUES
  ('Colt', 'C', false),
  ('Gelding', 'G', true),
  ('Stallion', 'S', false),
  ('Filly', 'F', false),
  ('Mare', 'M', false)
ON CONFLICT (name) DO NOTHING;