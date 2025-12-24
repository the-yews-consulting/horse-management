/*
  # Fix Function Search Path Security Issues

  ## Overview
  Fixes security issues where functions have role-mutable search paths.
  Sets explicit search path to prevent potential security vulnerabilities.

  ## Changes
  - Update create_activity_history() with SET search_path
  - Update update_profiles_updated_at() with SET search_path
  - Update update_updated_at_column() with SET search_path

  ## Security
  - Prevents search path manipulation attacks
  - Ensures functions always use correct schema
  - Follows PostgreSQL security best practices
*/

-- Fix create_activity_history function
CREATE OR REPLACE FUNCTION create_activity_history()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;

-- Fix update_profiles_updated_at function
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;