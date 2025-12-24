/*
  # Team Members Management System

  ## Overview
  Creates a comprehensive team members management system for stable staff,
  allowing admins to track team member details, roles, and contact information.

  ## 1. New Tables
  
  ### `team_members`
  Main table for managing stable team members
  - `id` (uuid, primary key) - Unique team member identifier
  - `user_id` (uuid) - Optional link to auth user account
  - `first_name` (text) - Team member's first name
  - `last_name` (text) - Team member's last name
  - `email` (text) - Email address
  - `phone` (text) - Phone number
  - `role` (text) - Job role: manager, trainer, groom, vet, farrier, admin, other
  - `is_active` (boolean) - Whether team member is currently active
  - `hire_date` (date) - Date team member was hired
  - `notes` (text) - Additional notes about team member
  - `created_at` (timestamptz) - When record was created
  - `updated_at` (timestamptz) - Last update timestamp
  - `created_by` (uuid) - User who created the record

  ## 2. Security
  - Enable RLS on team_members table
  - Authenticated users can view all team members
  - Only authenticated users can create team members
  - Only authenticated users can update team members
  - Only authenticated users can delete team members

  ## 3. Indexes
  - Index on email for fast lookups
  - Index on role for filtering
  - Index on is_active for filtering active members
*/

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'other' CHECK (role IN ('manager', 'trainer', 'groom', 'vet', 'farrier', 'admin', 'other')),
  is_active boolean DEFAULT true,
  hire_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_is_active ON team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members table
CREATE POLICY "Authenticated users can view all team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (true);

-- Trigger to update updated_at on team_members
DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();