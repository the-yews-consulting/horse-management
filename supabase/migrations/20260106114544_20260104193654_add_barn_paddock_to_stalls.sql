/*
  # Add Barn and Paddock references to Stalls

  1. Changes
    - Add `barn_id` (uuid, foreign key) - Reference to barns table
    - Add `paddock_id` (uuid, foreign key) - Reference to yards table (paddocks)
    - Keep existing `building` field for backward compatibility but will deprecate in UI

  2. Notes
    - The `building` text field will be replaced by `barn_id` dropdown in the UI
    - The `paddock_id` will only be used when `has_paddock_access` is true
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stalls' AND column_name = 'barn_id'
  ) THEN
    ALTER TABLE stalls ADD COLUMN barn_id uuid REFERENCES barns(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stalls' AND column_name = 'paddock_id'
  ) THEN
    ALTER TABLE stalls ADD COLUMN paddock_id uuid REFERENCES yards(id) ON DELETE SET NULL;
  END IF;
END $$;