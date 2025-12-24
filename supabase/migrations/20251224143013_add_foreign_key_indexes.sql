/*
  # Add Foreign Key Indexes

  ## Overview
  Adds indexes to foreign key columns to improve query performance,
  especially for JOIN operations and CASCADE deletes.

  ## Changes
  - Add index on activities.horse_id
  - Add index on activity_history.activity_id
  - Add index on boarding_assignments.stall_id
  - Add index on horses.farrier_id
  - Add index on horses.vet_id

  ## Performance Impact
  - Improves JOIN query performance
  - Speeds up CASCADE DELETE operations
  - Enables efficient foreign key constraint checking
  - Minimal impact on INSERT/UPDATE performance
*/

CREATE INDEX IF NOT EXISTS idx_activities_horse_id ON activities(horse_id);
CREATE INDEX IF NOT EXISTS idx_activity_history_activity_id ON activity_history(activity_id);
CREATE INDEX IF NOT EXISTS idx_boarding_assignments_stall_id ON boarding_assignments(stall_id);
CREATE INDEX IF NOT EXISTS idx_horses_farrier_id ON horses(farrier_id);
CREATE INDEX IF NOT EXISTS idx_horses_vet_id ON horses(vet_id);