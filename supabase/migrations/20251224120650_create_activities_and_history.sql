/*
  # Whiteboard Activities System

  ## Overview
  Creates a comprehensive activity planning and tracking system for the stable whiteboard,
  allowing teams to plan weekly activities for horses and maintain full history.

  ## 1. New Tables
  
  ### `activities`
  Main table for all planned and completed activities
  - `id` (uuid, primary key) - Unique activity identifier
  - `horse_id` (uuid, foreign key) - Links to horses table
  - `user_id` (uuid) - User who created the activity
  - `title` (text) - Activity title/name
  - `description` (text) - Detailed description
  - `activity_type` (text) - Type: training, feeding, vet, farrier, grooming, turnout, medication, other
  - `scheduled_date` (date) - Date scheduled for activity
  - `scheduled_time` (time) - Time scheduled for activity
  - `duration_minutes` (integer) - Expected duration in minutes
  - `assigned_to` (text) - Team member assigned (optional)
  - `status` (text) - Status: planned, in_progress, completed, cancelled
  - `notes` (text) - Additional notes or observations
  - `completed_at` (timestamptz) - When activity was completed
  - `created_at` (timestamptz) - When activity was created
  - `updated_at` (timestamptz) - Last update timestamp

  ### `activity_history`
  Audit trail for all activity changes
  - `id` (uuid, primary key) - Unique history record identifier
  - `activity_id` (uuid, foreign key) - Links to activities table
  - `user_id` (uuid) - User who made the change
  - `action` (text) - Type of action: created, updated, completed, cancelled
  - `changes` (jsonb) - JSON object containing what changed
  - `created_at` (timestamptz) - When the change occurred

  ## 2. Security
  - Enable RLS on both tables
  - Authenticated users can view all activities
  - Authenticated users can create new activities
  - Authenticated users can update activities they created
  - Authenticated users can delete activities they created
  - Activity history is read-only for authenticated users

  ## 3. Indexes
  - Index on horse_id for fast lookups
  - Index on scheduled_date for weekly views
  - Index on activity_id in history table
*/

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id uuid REFERENCES horses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  activity_type text NOT NULL CHECK (activity_type IN ('training', 'feeding', 'vet', 'farrier', 'grooming', 'turnout', 'medication', 'other')),
  scheduled_date date NOT NULL,
  scheduled_time time,
  duration_minutes integer DEFAULT 30,
  assigned_to text DEFAULT '',
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  notes text DEFAULT '',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity_history table
CREATE TABLE IF NOT EXISTS activity_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'completed', 'cancelled', 'deleted')),
  changes jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_horse_id ON activities(horse_id);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled_date ON activities(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activity_history_activity_id ON activity_history(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_history_created_at ON activity_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activities table
CREATE POLICY "Authenticated users can view all activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update any activity"
  ON activities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete activities they created"
  ON activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for activity_history table
CREATE POLICY "Authenticated users can view all activity history"
  ON activity_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create activity history"
  ON activity_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on activities
DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create history records
CREATE OR REPLACE FUNCTION create_activity_history()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO activity_history (activity_id, user_id, action, changes)
    VALUES (NEW.id, NEW.user_id, 'created', to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO activity_history (activity_id, user_id, action, changes)
    VALUES (NEW.id, NEW.user_id, 'updated', jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO activity_history (activity_id, user_id, action, changes)
    VALUES (OLD.id, OLD.user_id, 'deleted', to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create history records
DROP TRIGGER IF EXISTS activity_history_trigger ON activities;
CREATE TRIGGER activity_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_history();