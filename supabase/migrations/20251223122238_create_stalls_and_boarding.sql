/*
  # Create Stalls and Boarding Management Schema

  1. New Tables
    - `stalls`
      - `id` (uuid, primary key)
      - `name` (text, required) - Stall identifier/number
      - `building` (text) - Building name or location
      - `size` (text) - Dimensions or size category (e.g., "12x12", "large")
      - `has_paddock_access` (boolean) - Whether stall has paddock access
      - `notes` (text) - Additional notes about the stall
      - `user_id` (uuid, foreign key) - Links to auth.users for access control
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `boarding_assignments`
      - `id` (uuid, primary key)
      - `horse_id` (uuid, foreign key) - Links to horses table
      - `stall_id` (uuid, foreign key) - Links to stalls table
      - `boarding_type` (text) - Type: full, partial, or training
      - `monthly_rate` (numeric) - Monthly boarding cost
      - `start_date` (date) - When boarding started
      - `end_date` (date, nullable) - When boarding ended (null if active)
      - `notes` (text) - Additional boarding notes
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Users can only access stalls and boarding assignments they own

  3. Indexes
    - Index on stall_id for quick lookup of assignments
    - Index on horse_id for quick lookup of horse's current stall
    - Index on end_date to quickly find active assignments
*/

-- Create stalls table
CREATE TABLE IF NOT EXISTS stalls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  building text,
  size text,
  has_paddock_access boolean DEFAULT false,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create boarding_assignments table
CREATE TABLE IF NOT EXISTS boarding_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id uuid REFERENCES horses(id) ON DELETE CASCADE NOT NULL,
  stall_id uuid REFERENCES stalls(id) ON DELETE CASCADE NOT NULL,
  boarding_type text NOT NULL CHECK (boarding_type IN ('full', 'partial', 'training')),
  monthly_rate numeric(10, 2) DEFAULT 0,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stalls_user_id ON stalls(user_id);
CREATE INDEX IF NOT EXISTS idx_boarding_assignments_horse_id ON boarding_assignments(horse_id);
CREATE INDEX IF NOT EXISTS idx_boarding_assignments_stall_id ON boarding_assignments(stall_id);
CREATE INDEX IF NOT EXISTS idx_boarding_assignments_end_date ON boarding_assignments(end_date);

-- Enable Row Level Security
ALTER TABLE stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE boarding_assignments ENABLE ROW LEVEL SECURITY;

-- Stalls policies: Users can only access their own stalls
CREATE POLICY "Users can view own stalls"
  ON stalls FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stalls"
  ON stalls FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stalls"
  ON stalls FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stalls"
  ON stalls FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Boarding assignments policies: Users can access assignments for their horses and stalls
CREATE POLICY "Users can view boarding assignments for their horses"
  ON boarding_assignments FOR SELECT
  TO authenticated
  USING (
    horse_id IN (
      SELECT id FROM horses WHERE owner_id IN (
        SELECT id FROM owners WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert boarding assignments for their horses"
  ON boarding_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    horse_id IN (
      SELECT id FROM horses WHERE owner_id IN (
        SELECT id FROM owners WHERE user_id = auth.uid()
      )
    )
    AND
    stall_id IN (
      SELECT id FROM stalls WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update boarding assignments for their horses"
  ON boarding_assignments FOR UPDATE
  TO authenticated
  USING (
    horse_id IN (
      SELECT id FROM horses WHERE owner_id IN (
        SELECT id FROM owners WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    horse_id IN (
      SELECT id FROM horses WHERE owner_id IN (
        SELECT id FROM owners WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete boarding assignments for their horses"
  ON boarding_assignments FOR DELETE
  TO authenticated
  USING (
    horse_id IN (
      SELECT id FROM horses WHERE owner_id IN (
        SELECT id FROM owners WHERE user_id = auth.uid()
      )
    )
  );

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_stalls_updated_at
  BEFORE UPDATE ON stalls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boarding_assignments_updated_at
  BEFORE UPDATE ON boarding_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();