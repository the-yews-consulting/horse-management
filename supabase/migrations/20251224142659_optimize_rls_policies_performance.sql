/*
  # Optimize RLS Policies for Performance

  ## Overview
  Fixes performance issues in RLS policies by wrapping auth function calls
  in SELECT statements to prevent re-evaluation for each row.

  ## Changes
  - Update all policies using `auth.uid()` to use `(select auth.uid())`
  - This prevents the function from being called multiple times per query
  - Significantly improves query performance at scale

  ## Security
  - No changes to security model
  - Maintains all existing access controls
  - Only optimizes execution performance

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
  - profiles
*/

-- ============================================================================
-- OWNERS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own owner records" ON owners;
DROP POLICY IF EXISTS "Users can insert own owner records" ON owners;
DROP POLICY IF EXISTS "Users can update own owner records" ON owners;
DROP POLICY IF EXISTS "Users can delete own owner records" ON owners;

CREATE POLICY "Users can view own owner records"
  ON owners FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own owner records"
  ON owners FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own owner records"
  ON owners FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own owner records"
  ON owners FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- HORSES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view horses they own" ON horses;
DROP POLICY IF EXISTS "Users can insert horses for their owner records" ON horses;
DROP POLICY IF EXISTS "Users can update horses they own" ON horses;
DROP POLICY IF EXISTS "Users can delete horses they own" ON horses;

CREATE POLICY "Users can view horses they own"
  ON horses FOR SELECT
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM owners WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert horses for their owner records"
  ON horses FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id IN (
      SELECT id FROM owners WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update horses they own"
  ON horses FOR UPDATE
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM owners WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    owner_id IN (
      SELECT id FROM owners WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete horses they own"
  ON horses FOR DELETE
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM owners WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- STALLS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own stalls" ON stalls;
DROP POLICY IF EXISTS "Users can insert own stalls" ON stalls;
DROP POLICY IF EXISTS "Users can update own stalls" ON stalls;
DROP POLICY IF EXISTS "Users can delete own stalls" ON stalls;

CREATE POLICY "Users can view own stalls"
  ON stalls FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own stalls"
  ON stalls FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own stalls"
  ON stalls FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own stalls"
  ON stalls FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- BOARDING ASSIGNMENTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view boarding assignments for their horses" ON boarding_assignments;
DROP POLICY IF EXISTS "Users can insert boarding assignments for their horses" ON boarding_assignments;
DROP POLICY IF EXISTS "Users can update boarding assignments for their horses" ON boarding_assignments;
DROP POLICY IF EXISTS "Users can delete boarding assignments for their horses" ON boarding_assignments;

CREATE POLICY "Users can view boarding assignments for their horses"
  ON boarding_assignments FOR SELECT
  TO authenticated
  USING (
    horse_id IN (
      SELECT h.id FROM horses h
      INNER JOIN owners o ON h.owner_id = o.id
      WHERE o.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert boarding assignments for their horses"
  ON boarding_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    horse_id IN (
      SELECT h.id FROM horses h
      INNER JOIN owners o ON h.owner_id = o.id
      WHERE o.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update boarding assignments for their horses"
  ON boarding_assignments FOR UPDATE
  TO authenticated
  USING (
    horse_id IN (
      SELECT h.id FROM horses h
      INNER JOIN owners o ON h.owner_id = o.id
      WHERE o.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    horse_id IN (
      SELECT h.id FROM horses h
      INNER JOIN owners o ON h.owner_id = o.id
      WHERE o.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete boarding assignments for their horses"
  ON boarding_assignments FOR DELETE
  TO authenticated
  USING (
    horse_id IN (
      SELECT h.id FROM horses h
      INNER JOIN owners o ON h.owner_id = o.id
      WHERE o.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- VETS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own vet records" ON vets;
DROP POLICY IF EXISTS "Users can insert own vet records" ON vets;
DROP POLICY IF EXISTS "Users can update own vet records" ON vets;
DROP POLICY IF EXISTS "Users can delete own vet records" ON vets;

CREATE POLICY "Users can view own vet records"
  ON vets FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own vet records"
  ON vets FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own vet records"
  ON vets FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own vet records"
  ON vets FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- FARRIERS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own farrier records" ON farriers;
DROP POLICY IF EXISTS "Users can insert own farrier records" ON farriers;
DROP POLICY IF EXISTS "Users can update own farrier records" ON farriers;
DROP POLICY IF EXISTS "Users can delete own farrier records" ON farriers;

CREATE POLICY "Users can view own farrier records"
  ON farriers FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own farrier records"
  ON farriers FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own farrier records"
  ON farriers FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own farrier records"
  ON farriers FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- ACTIVITIES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can create activities" ON activities;
DROP POLICY IF EXISTS "Users can update their activities" ON activities;
DROP POLICY IF EXISTS "Authenticated users can delete activities they created" ON activities;

CREATE POLICY "Users can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their activities"
  ON activities FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Authenticated users can delete activities they created"
  ON activities FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- ACTIVITY HISTORY TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can create activity history" ON activity_history;

CREATE POLICY "Users can create activity history"
  ON activity_history FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- TEAM MEMBERS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can create team members" ON team_members;

CREATE POLICY "Admins can create team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_higher() AND (select auth.uid()) = created_by);

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Enable profile creation"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = id OR is_super_admin()
  );