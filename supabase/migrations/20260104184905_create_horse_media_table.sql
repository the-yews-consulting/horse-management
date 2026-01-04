/*
  # Create horse media table

  1. New Tables
    - `horse_media`
      - `id` (uuid, primary key)
      - `horse_id` (uuid, foreign key to horses)
      - `media_type` (text, 'image' or 'video')
      - `file_url` (text, URL or data URL for the media file)
      - `thumbnail_url` (text, thumbnail for videos)
      - `title` (text, optional title)
      - `description` (text, optional description)
      - `date_taken` (date, date of media)
      - `is_private` (boolean, default false)
      - `duration` (integer, video duration in seconds, optional)
      - `width` (integer, media width)
      - `height` (integer, media height)
      - `file_size` (integer, file size in bytes)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, update timestamp)

  2. Security
    - Enable RLS on `horse_media` table
    - Add policy for authenticated users to view media for horses they can access
    - Add policy for authenticated users to create/update/delete their own horses' media
    - Add policy for admins to manage all media
*/

CREATE TABLE IF NOT EXISTS horse_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id uuid NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  file_url text NOT NULL,
  thumbnail_url text,
  title text,
  description text,
  date_taken date DEFAULT CURRENT_DATE,
  is_private boolean DEFAULT false,
  duration integer,
  width integer,
  height integer,
  file_size integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE horse_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view horse media"
  ON horse_media
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM horses
      WHERE horses.id = horse_media.horse_id
    )
  );

CREATE POLICY "Authenticated users can create media for accessible horses"
  ON horse_media
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM horses
      WHERE horses.id = horse_media.horse_id
    )
  );

CREATE POLICY "Users can update their horses' media or admins can update any"
  ON horse_media
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM horses
      WHERE horses.id = horse_media.horse_id
      AND (
        horses.owner_id IN (
          SELECT owners.id FROM owners
          WHERE owners.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('admin', 'super_admin')
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM horses
      WHERE horses.id = horse_media.horse_id
      AND (
        horses.owner_id IN (
          SELECT owners.id FROM owners
          WHERE owners.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('admin', 'super_admin')
        )
      )
    )
  );

CREATE POLICY "Users can delete their horses' media or admins can delete any"
  ON horse_media
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM horses
      WHERE horses.id = horse_media.horse_id
      AND (
        horses.owner_id IN (
          SELECT owners.id FROM owners
          WHERE owners.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('admin', 'super_admin')
        )
      )
    )
  );

CREATE INDEX IF NOT EXISTS idx_horse_media_horse_id ON horse_media(horse_id);
CREATE INDEX IF NOT EXISTS idx_horse_media_date_taken ON horse_media(date_taken DESC);