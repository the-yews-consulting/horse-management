/*
  # Fix User Accounts Function

  ## Overview
  Fixes the get_all_user_accounts function to match the exact column types
  from auth.users table.

  ## Changes
  - Updates function to use correct data types (varchar instead of text where needed)
  - Ensures return types match auth.users schema exactly

  ## Security
  - Maintains SECURITY DEFINER to allow reading auth.users
  - Still requires authentication
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_all_user_accounts();

-- Recreate with correct types matching auth.users schema
CREATE OR REPLACE FUNCTION get_all_user_accounts()
RETURNS TABLE (
  id uuid,
  email varchar,
  email_confirmed_at timestamptz,
  phone varchar,
  created_at timestamptz,
  updated_at timestamptz,
  last_sign_in_at timestamptz,
  raw_user_meta_data jsonb,
  raw_app_meta_data jsonb
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Return user account data from auth.users
  RETURN QUERY
  SELECT 
    u.id,
    u.email::varchar,
    u.email_confirmed_at,
    u.phone::varchar,
    u.created_at,
    u.updated_at,
    u.last_sign_in_at,
    u.raw_user_meta_data,
    u.raw_app_meta_data
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_user_accounts() TO authenticated;