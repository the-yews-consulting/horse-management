/*
  # Add markings image column to horses table

  1. Changes
    - Add `markings_image` column to horses table to store the markings drawing as a data URL or URL to stored image
    
  2. Notes
    - Field is nullable as existing horses may not have markings images
    - Stores the image as text (data URL or external URL)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'horses' AND column_name = 'markings_image'
  ) THEN
    ALTER TABLE horses ADD COLUMN markings_image text;
  END IF;
END $$;