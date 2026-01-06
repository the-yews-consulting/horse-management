/*
  # Create Barns Table

  1. New Tables
    - `barns`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Name of the barn
      - `yard_id` (uuid, foreign key) - Reference to yards table (barns belong to yards)
      - `active` (boolean) - Whether the barn is active
      - `note` (text) - Additional notes
      - `media_urls` (jsonb) - Array of media URLs
      - `map_location` (jsonb) - Map coordinates and address
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `barns` table
    - Add policies for authenticated users to manage barns
*/

CREATE TABLE IF NOT EXISTS barns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  yard_id uuid REFERENCES yards(id) ON DELETE SET NULL,
  active boolean DEFAULT true,
  note text,
  media_urls jsonb DEFAULT '[]'::jsonb,
  map_location jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE barns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view barns"
  ON barns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert barns"
  ON barns FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update barns"
  ON barns FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete barns"
  ON barns FOR DELETE
  TO authenticated
  USING (true);