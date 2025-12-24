/*
  # Add Veterinarian and Farrier References to Horses

  1. Changes
    - Add `vet_id` column to horses table
      - Foreign key reference to vets table
      - Nullable (horses can exist without assigned vet)
    - Add `farrier_id` column to horses table
      - Foreign key reference to farriers table
      - Nullable (horses can exist without assigned farrier)
    - Create indexes for better query performance
  
  2. Security
    - No RLS changes needed (inherits from existing horses policies)
*/

-- Add vet_id column to horses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'horses' AND column_name = 'vet_id'
  ) THEN
    ALTER TABLE horses ADD COLUMN vet_id uuid REFERENCES vets(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add farrier_id column to horses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'horses' AND column_name = 'farrier_id'
  ) THEN
    ALTER TABLE horses ADD COLUMN farrier_id uuid REFERENCES farriers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_horses_vet_id ON horses(vet_id);
CREATE INDEX IF NOT EXISTS idx_horses_farrier_id ON horses(farrier_id);
