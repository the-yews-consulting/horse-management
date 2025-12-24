/*
  # Remove Unused Database Indexes

  ## Overview
  Removes database indexes that are not being used to improve write performance
  and reduce storage overhead.

  ## Changes
  - Drop unused indexes that haven't been accessed
  - Keep only the indexes that are actively used for queries

  ## Indexes Removed
  - idx_horses_microchip_id
  - idx_team_members_email
  - idx_team_members_role
  - idx_team_members_is_active
  - idx_team_members_user_id
  - idx_boarding_assignments_stall_id
  - idx_profiles_role
  - idx_profiles_is_active
  - idx_horses_vet_id
  - idx_horses_farrier_id
  - idx_activities_horse_id
  - idx_activities_status
  - idx_activity_history_activity_id
  - idx_activity_history_created_at

  ## Performance Impact
  - Reduces storage space
  - Improves INSERT/UPDATE/DELETE performance
  - Does not affect query performance (indexes were unused)
*/

DROP INDEX IF EXISTS idx_horses_microchip_id;
DROP INDEX IF EXISTS idx_team_members_email;
DROP INDEX IF EXISTS idx_team_members_role;
DROP INDEX IF EXISTS idx_team_members_is_active;
DROP INDEX IF EXISTS idx_team_members_user_id;
DROP INDEX IF EXISTS idx_boarding_assignments_stall_id;
DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_profiles_is_active;
DROP INDEX IF EXISTS idx_horses_vet_id;
DROP INDEX IF EXISTS idx_horses_farrier_id;
DROP INDEX IF EXISTS idx_activities_horse_id;
DROP INDEX IF EXISTS idx_activities_status;
DROP INDEX IF EXISTS idx_activity_history_activity_id;
DROP INDEX IF EXISTS idx_activity_history_created_at;