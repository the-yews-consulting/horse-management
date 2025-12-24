/*
  # Create Veterinarians and Farriers Management System

  1. New Tables
    - `vets`
      - `id` (uuid, primary key)
      - `name` (text, required) - Full name of the veterinarian
      - `address` (text) - Physical address
      - `mobile_phone` (text) - Mobile contact number
      - `office_phone` (text) - Office contact number
      - `bank_account_name` (text) - Name on bank account
      - `bank_account_number` (text) - Bank account number
      - `bank_routing_number` (text) - Bank routing/sort code
      - `notes` (text) - Additional notes about the vet
      - `user_id` (uuid, foreign key) - Links to auth.users for access control
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `farriers`
      - `id` (uuid, primary key)
      - `name` (text, required) - Full name of the farrier
      - `address` (text) - Physical address
      - `mobile_phone` (text) - Mobile contact number
      - `office_phone` (text) - Office contact number
      - `bank_account_name` (text) - Name on bank account
      - `bank_account_number` (text) - Bank account number
      - `bank_routing_number` (text) - Bank routing/sort code
      - `notes` (text) - Additional notes about the farrier
      - `user_id` (uuid, foreign key) - Links to auth.users for access control
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Users can only access their own records
*/

-- Create vets table
CREATE TABLE IF NOT EXISTS vets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  mobile_phone text,
  office_phone text,
  bank_account_name text,
  bank_account_number text,
  bank_routing_number text,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create farriers table
CREATE TABLE IF NOT EXISTS farriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  mobile_phone text,
  office_phone text,
  bank_account_name text,
  bank_account_number text,
  bank_routing_number text,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vets_user_id ON vets(user_id);
CREATE INDEX IF NOT EXISTS idx_farriers_user_id ON farriers(user_id);

-- Enable Row Level Security
ALTER TABLE vets ENABLE ROW LEVEL SECURITY;
ALTER TABLE farriers ENABLE ROW LEVEL SECURITY;

-- Vets policies: Users can only access their own vet records
CREATE POLICY "Users can view own vet records"
  ON vets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vet records"
  ON vets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vet records"
  ON vets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vet records"
  ON vets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Farriers policies: Users can only access their own farrier records
CREATE POLICY "Users can view own farrier records"
  ON farriers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own farrier records"
  ON farriers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farrier records"
  ON farriers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own farrier records"
  ON farriers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_vets_updated_at
  BEFORE UPDATE ON vets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farriers_updated_at
  BEFORE UPDATE ON farriers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
