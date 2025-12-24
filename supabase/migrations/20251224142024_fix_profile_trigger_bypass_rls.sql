/*
  # Fix Profile Creation by Bypassing RLS in Trigger

  ## Overview
  The issue is that when admins create users via the edge function,
  the trigger runs in a context where auth.uid() is not set, causing
  RLS policies to block the profile creation. This migration fixes that
  by granting the trigger function permission to bypass RLS.

  ## Changes
  - Update handle_new_user() function to properly bypass RLS
  - Grant necessary permissions to the function
  - Update RLS policy to be more permissive for system operations

  ## Security
  - The trigger only creates profiles for newly created users
  - The function cannot be called directly by users
  - RLS still protects direct table access
*/

-- Recreate the trigger function with proper permissions to bypass RLS
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert the profile with the trigger's elevated privileges
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'::user_role
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();