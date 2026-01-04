/*
  # Create Locations Tables (Farms and Yards)

  1. New Tables
    - `farms`
      - `id` (uuid, primary key)
      - `name` (text, required) - Farm/location name
      - `type` (text) - Farm type: General, Stud, Training
      - `manager_trainer_name` (text) - Name of manager/trainer
      - `address` (text) - Full address
      - `country` (text) - UK countries + Ireland
      - `office_no` (text) - Office phone number
      - `mobile_no` (text) - Mobile phone number
      - `fax_no` (text) - Fax number
      - `email` (text) - Email address
      - `registration_number` (text) - Registration number
      - `billing_centre` (text) - Billing centre reference
      - `active` (boolean, default true) - Whether farm is active
      - `note` (text) - Additional notes
      - `media_urls` (jsonb) - Array of media image URLs
      - `map_location` (jsonb) - Google Maps location data {lat, lng, address}
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `yards`
      - `id` (uuid, primary key)
      - `name` (text, required) - Yard/paddock name
      - `farm_id` (uuid, foreign key) - Reference to parent farm
      - `active` (boolean, default true) - Whether yard is active
      - `note` (text) - Additional notes
      - `media_urls` (jsonb) - Array of media image URLs
      - `map_location` (jsonb) - Google Maps location data {lat, lng, address}
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage locations
*/

-- Create farms table
CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text CHECK (type IN ('General', 'Stud', 'Training')),
  manager_trainer_name text,
  address text,
  country text,
  office_no text,
  mobile_no text,
  fax_no text,
  email text,
  registration_number text,
  billing_centre text,
  active boolean DEFAULT true,
  note text,
  media_urls jsonb DEFAULT '[]'::jsonb,
  map_location jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create yards table
CREATE TABLE IF NOT EXISTS yards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  active boolean DEFAULT true,
  note text,
  media_urls jsonb DEFAULT '[]'::jsonb,
  map_location jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE yards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farms
CREATE POLICY "Authenticated users can view farms"
  ON farms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert farms"
  ON farms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update farms"
  ON farms FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete farms"
  ON farms FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for yards
CREATE POLICY "Authenticated users can view yards"
  ON yards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert yards"
  ON yards FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update yards"
  ON yards FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete yards"
  ON yards FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_farms_active ON farms(active);
CREATE INDEX IF NOT EXISTS idx_farms_type ON farms(type);
CREATE INDEX IF NOT EXISTS idx_yards_farm_id ON yards(farm_id);
CREATE INDEX IF NOT EXISTS idx_yards_active ON yards(active);