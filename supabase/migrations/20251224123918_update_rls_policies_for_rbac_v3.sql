/*
  # Update RLS Policies for RBAC (v3)

  ## Overview
  Updates Row Level Security policies across all tables to implement
  role-based access control, giving appropriate permissions to super_admins,
  admins, and moderators while maintaining security.

  ## Changes
  - Super admins have full access to all tables
  - Admins can view and manage most data
  - Regular users have standard view access and can create records

  ## Tables Updated
  - owners
  - horses
  - stalls
  - boarding_assignments
  - vets
  - farriers
  - activities
  - activity_history
  - team_members

  ## Security
  All policies maintain authentication requirements and add role checks
*/

-- ============================================================================
-- OWNERS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view all owners" ON owners;
DROP POLICY IF EXISTS "Authenticated users can create owners" ON owners;
DROP POLICY IF EXISTS "Authenticated users can update owners" ON owners;
DROP POLICY IF EXISTS "Authenticated users can delete owners" ON owners;

CREATE POLICY "Users can view owners"
  ON owners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create owners"
  ON owners FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update owners"
  ON owners FOR UPDATE
  TO authenticated
  USING (is_admin_or_higher())
  WITH CHECK (is_admin_or_higher());

CREATE POLICY "Admins can delete owners"
  ON owners FOR DELETE
  TO authenticated
  USING (is_admin_or_higher());

-- ============================================================================
-- HORSES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view all horses" ON horses;
DROP POLICY IF EXISTS "Authenticated users can create horses" ON horses;
DROP POLICY IF EXISTS "Authenticated users can update horses" ON horses;
DROP POLICY IF EXISTS "Authenticated users can delete horses" ON horses;

CREATE POLICY "Users can view horses"
  ON horses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create horses"
  ON horses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update horses"
  ON horses FOR UPDATE
  TO authenticated
  USING (is_admin_or_higher())
  WITH CHECK (is_admin_or_higher());

CREATE POLICY "Admins can delete horses"
  ON horses FOR DELETE
  TO authenticated
  USING (is_admin_or_higher());

-- ============================================================================
-- STALLS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view all stalls" ON stalls;
DROP POLICY IF EXISTS "Authenticated users can create stalls" ON stalls;
DROP POLICY IF EXISTS "Authenticated users can update stalls" ON stalls;
DROP POLICY IF EXISTS "Authenticated users can delete stalls" ON stalls;

CREATE POLICY "Users can view stalls"
  ON stalls FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create stalls"
  ON stalls FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_higher());

CREATE POLICY "Admins can update stalls"
  ON stalls FOR UPDATE
  TO authenticated
  USING (is_admin_or_higher())
  WITH CHECK (is_admin_or_higher());

CREATE POLICY "Super admins can delete stalls"
  ON stalls FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- ============================================================================
-- BOARDING ASSIGNMENTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view boarding assignments" ON boarding_assignments;
DROP POLICY IF EXISTS "Authenticated users can create boarding assignments" ON boarding_assignments;
DROP POLICY IF EXISTS "Authenticated users can update boarding assignments" ON boarding_assignments;
DROP POLICY IF EXISTS "Authenticated users can delete boarding assignments" ON boarding_assignments;

CREATE POLICY "Users can view boarding assignments"
  ON boarding_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create boarding assignments"
  ON boarding_assignments FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_higher());

CREATE POLICY "Admins can update boarding assignments"
  ON boarding_assignments FOR UPDATE
  TO authenticated
  USING (is_admin_or_higher())
  WITH CHECK (is_admin_or_higher());

CREATE POLICY "Super admins can delete boarding assignments"
  ON boarding_assignments FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- ============================================================================
-- VETS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view all vets" ON vets;
DROP POLICY IF EXISTS "Authenticated users can create vets" ON vets;
DROP POLICY IF EXISTS "Authenticated users can update vets" ON vets;
DROP POLICY IF EXISTS "Authenticated users can delete vets" ON vets;

CREATE POLICY "Users can view vets"
  ON vets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create vets"
  ON vets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update vets"
  ON vets FOR UPDATE
  TO authenticated
  USING (is_admin_or_higher())
  WITH CHECK (is_admin_or_higher());

CREATE POLICY "Admins can delete vets"
  ON vets FOR DELETE
  TO authenticated
  USING (is_admin_or_higher());

-- ============================================================================
-- FARRIERS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view all farriers" ON farriers;
DROP POLICY IF EXISTS "Authenticated users can create farriers" ON farriers;
DROP POLICY IF EXISTS "Authenticated users can update farriers" ON farriers;
DROP POLICY IF EXISTS "Authenticated users can delete farriers" ON farriers;

CREATE POLICY "Users can view farriers"
  ON farriers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create farriers"
  ON farriers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update farriers"
  ON farriers FOR UPDATE
  TO authenticated
  USING (is_admin_or_higher())
  WITH CHECK (is_admin_or_higher());

CREATE POLICY "Admins can delete farriers"
  ON farriers FOR DELETE
  TO authenticated
  USING (is_admin_or_higher());

-- ============================================================================
-- ACTIVITIES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view all activities" ON activities;
DROP POLICY IF EXISTS "Authenticated users can create activities" ON activities;
DROP POLICY IF EXISTS "Authenticated users can update activities" ON activities;
DROP POLICY IF EXISTS "Authenticated users can delete activities" ON activities;

CREATE POLICY "Users can view activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (is_admin_or_higher())
  WITH CHECK (is_admin_or_higher());

CREATE POLICY "Admins can delete activities"
  ON activities FOR DELETE
  TO authenticated
  USING (is_admin_or_higher());

-- ============================================================================
-- ACTIVITY HISTORY TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view activity history" ON activity_history;
DROP POLICY IF EXISTS "Authenticated users can create activity history" ON activity_history;

CREATE POLICY "Users can view activity history"
  ON activity_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create activity history"
  ON activity_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete activity history"
  ON activity_history FOR DELETE
  TO authenticated
  USING (is_admin_or_higher());

-- ============================================================================
-- TEAM MEMBERS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view all team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can create team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can update team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can delete team members" ON team_members;

CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_higher() AND auth.uid() = created_by);

CREATE POLICY "Admins can update team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (is_admin_or_higher())
  WITH CHECK (is_admin_or_higher());

CREATE POLICY "Admins can delete team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (is_admin_or_higher());