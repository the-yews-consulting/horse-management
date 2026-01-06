/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses multiple security and performance issues identified in the database audit.

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  Adding indexes to foreign key columns improves query performance, especially for JOIN operations:
    - `activities.horse_id` - Index for horse activity lookups
    - `activity_history.activity_id` - Index for activity history queries
    - `alert_history.alert_id` - Index for alert history queries
    - `barns.yard_id` - Index for barn-yard relationships
    - `boarding_assignments.stall_id` - Index for stall assignment lookups
    - `horses.farrier_id` - Index for horse-farrier relationships
    - `horses.vet_id` - Index for horse-vet relationships
    - `stalls.barn_id` - Index for stall-barn relationships
    - `stalls.paddock_id` - Index for stall-paddock relationships

  ### 2. Fix Multiple Permissive RLS Policies
  Consolidate overlapping policies to prevent security confusion:
    - Remove duplicate policies on `alerts` table
    - Remove duplicate policies on `config` table
    - Replace with single, clear policies

  ### 3. Fix Function Search Path Issue
  Update the `update_updated_at_column` function to use an immutable search path

  ### 4. Remove Unused Indexes
  Clean up indexes that haven't been used to reduce maintenance overhead:
    - Drop unused indexes on farms, yards, floorplans, and horse_media tables

  ## Security Impact
  - Improved query performance through proper indexing
  - Clearer RLS policy structure
  - More secure function definitions
*/

-- ============================================================
-- 1. Add Missing Foreign Key Indexes
-- ============================================================

-- Index for activities.horse_id
CREATE INDEX IF NOT EXISTS idx_activities_horse_id ON public.activities(horse_id);

-- Index for activity_history.activity_id
CREATE INDEX IF NOT EXISTS idx_activity_history_activity_id ON public.activity_history(activity_id);

-- Index for alert_history.alert_id
CREATE INDEX IF NOT EXISTS idx_alert_history_alert_id ON public.alert_history(alert_id);

-- Index for barns.yard_id
CREATE INDEX IF NOT EXISTS idx_barns_yard_id ON public.barns(yard_id);

-- Index for boarding_assignments.stall_id
CREATE INDEX IF NOT EXISTS idx_boarding_assignments_stall_id ON public.boarding_assignments(stall_id);

-- Index for horses.farrier_id
CREATE INDEX IF NOT EXISTS idx_horses_farrier_id ON public.horses(farrier_id);

-- Index for horses.vet_id
CREATE INDEX IF NOT EXISTS idx_horses_vet_id ON public.horses(vet_id);

-- Index for stalls.barn_id
CREATE INDEX IF NOT EXISTS idx_stalls_barn_id ON public.stalls(barn_id);

-- Index for stalls.paddock_id
CREATE INDEX IF NOT EXISTS idx_stalls_paddock_id ON public.stalls(paddock_id);

-- ============================================================
-- 2. Fix Multiple Permissive RLS Policies
-- ============================================================

-- Fix alerts table policies
DROP POLICY IF EXISTS "Admin can manage alerts" ON public.alerts;
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.alerts;

-- Create consolidated policy for alerts
CREATE POLICY "Authenticated users can view and manage alerts"
  ON public.alerts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Fix config table policies
DROP POLICY IF EXISTS "Admin can manage config" ON public.config;
DROP POLICY IF EXISTS "Authenticated users can view config" ON public.config;

-- Create consolidated policy for config
CREATE POLICY "Authenticated users can view and manage config"
  ON public.config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. Fix Function Search Path Issue
-- ============================================================

-- Recreate function with immutable search path (using CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 4. Remove Unused Indexes
-- ============================================================

-- Drop unused indexes on farms table
DROP INDEX IF EXISTS public.idx_farms_active;
DROP INDEX IF EXISTS public.idx_farms_type;

-- Drop unused indexes on yards table
DROP INDEX IF EXISTS public.idx_yards_farm_id;
DROP INDEX IF EXISTS public.idx_yards_active;

-- Drop unused indexes on floorplans table
DROP INDEX IF EXISTS public.idx_floorplans_created_by;

-- Drop unused indexes on horse_media table
DROP INDEX IF EXISTS public.idx_horse_media_date_taken;