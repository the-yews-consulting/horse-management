/*
  # Add Missing Tables for Stable Management

  ## New Tables
  1. **horse_statuses** - Horse status lookup table (Active, Retired, etc.)
  
  ## Security
  - Enable RLS on all new tables
  - Add policies for authenticated users to manage data
*/

-- Horse statuses lookup
CREATE TABLE IF NOT EXISTS horse_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_dead BOOLEAN DEFAULT false,
  selected_by_default BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE horse_statuses ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'horse_statuses' AND policyname = 'Authenticated users can view statuses'
  ) THEN
    CREATE POLICY "Authenticated users can view statuses"
      ON horse_statuses FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'horse_statuses' AND policyname = 'Authenticated users can insert statuses'
  ) THEN
    CREATE POLICY "Authenticated users can insert statuses"
      ON horse_statuses FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'horse_statuses' AND policyname = 'Authenticated users can update statuses'
  ) THEN
    CREATE POLICY "Authenticated users can update statuses"
      ON horse_statuses FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'horse_statuses' AND policyname = 'Authenticated users can delete statuses'
  ) THEN
    CREATE POLICY "Authenticated users can delete statuses"
      ON horse_statuses FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Insert default data for horse statuses
INSERT INTO horse_statuses (description, is_default, is_dead, selected_by_default) VALUES
  ('Active', true, false, true),
  ('Retired', false, false, true),
  ('Injured', false, false, true),
  ('Deceased', false, true, false)
ON CONFLICT DO NOTHING;