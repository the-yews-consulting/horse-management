/*
  # Create Horse Management System Schema

  1. New Tables
    - `owners`
      - `id` (uuid, primary key)
      - `name` (text, required) - Full name of the horse owner
      - `email` (text, unique) - Contact email address
      - `phone` (text) - Contact phone number
      - `address` (text) - Physical address
      - `notes` (text) - Additional notes about the owner
      - `user_id` (uuid, foreign key) - Links to auth.users for access control
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `horses`
      - `id` (uuid, primary key)
      - `name` (text, required) - Horse's name
      - `breed` (text) - Horse breed
      - `color` (text) - Horse color/markings
      - `date_of_birth` (date) - Birth date for age calculation
      - `microchip_id` (text, unique) - Unique microchip identifier
      - `registration_number` (text) - Official registration number
      - `medical_notes` (text) - Medical history and notes
      - `dietary_requirements` (text) - Feeding instructions and dietary needs
      - `owner_id` (uuid, foreign key) - Links to owners table
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Owners can only access their own records
    - Users can only see horses linked to their owner records
*/

-- Create owners table
CREATE TABLE IF NOT EXISTS owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  address text,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create horses table
CREATE TABLE IF NOT EXISTS horses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  breed text,
  color text,
  date_of_birth date,
  microchip_id text UNIQUE,
  registration_number text,
  medical_notes text,
  dietary_requirements text,
  owner_id uuid REFERENCES owners(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_horses_owner_id ON horses(owner_id);
CREATE INDEX IF NOT EXISTS idx_horses_microchip_id ON horses(microchip_id);
CREATE INDEX IF NOT EXISTS idx_owners_user_id ON owners(user_id);

-- Enable Row Level Security
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;

-- Owners policies: Users can only access their own owner records
CREATE POLICY "Users can view own owner records"
  ON owners FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own owner records"
  ON owners FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own owner records"
  ON owners FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own owner records"
  ON owners FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Horses policies: Users can only access horses linked to their owner records
CREATE POLICY "Users can view horses they own"
  ON horses FOR SELECT
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert horses for their owner records"
  ON horses FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id IN (
      SELECT id FROM owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update horses they own"
  ON horses FOR UPDATE
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM owners WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    owner_id IN (
      SELECT id FROM owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete horses they own"
  ON horses FOR DELETE
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM owners WHERE user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_owners_updated_at
  BEFORE UPDATE ON owners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_horses_updated_at
  BEFORE UPDATE ON horses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();