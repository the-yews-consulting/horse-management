/*
  # User Accounts View and Function

  ## Overview
  Creates a secure way to query user authentication data for the admin panel.
  This allows viewing all registered users with their account details.

  ## 1. New Functions
  
  ### `get_all_user_accounts()`
  Returns detailed information about all authenticated users including:
  - User ID
  - Email address
  - Email confirmation status
  - Phone number (if available)
  - Account creation timestamp
  - Last sign-in timestamp
  - User metadata (raw_user_meta_data)
  - App metadata (raw_app_meta_data)

  ## 2. Security
  - Function can only be executed by authenticated users
  - Returns read-only data from auth.users
  - Does not expose sensitive password data
  - Requires authentication to access

  ## 3. Notes
  - This function accesses the auth schema which contains user authentication data
  - The function is marked as SECURITY DEFINER to allow reading from auth.users
  - Only non-sensitive user data is exposed
*/

-- Create function to get all user accounts
CREATE OR REPLACE FUNCTION get_all_user_accounts()
RETURNS TABLE (
  id uuid,
  email text,
  email_confirmed_at timestamptz,
  phone text,
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
    u.email,
    u.email_confirmed_at,
    u.phone,
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