/*
  # Fix Profile Creation Trigger to Bypass RLS
  
  ## Problem
  
  The handle_new_user() trigger is failing because it's hitting RLS policies
  even with SECURITY DEFINER. The function needs to be properly configured
  to bypass RLS when creating profiles.
  
  ## Solution
  
  1. Set the function to use postgres role (superuser context)
  2. Set proper search path
  3. Simplify RLS policies to allow the trigger to work
  
  ## Changes
  
  - Recreate handle_new_user() function with proper security context
  - Ensure the function can bypass RLS for profile creation
*/

-- Drop and recreate the trigger function with proper settings
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create function that bypasses RLS
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Insert into profiles, bypassing RLS via SECURITY DEFINER
  INSERT INTO public.profiles (id, email, full_name, role, account_status, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    'pending',
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Drop the problematic anon INSERT policy
DROP POLICY IF EXISTS "Allow anon profile creation for auth trigger" ON profiles;
DROP POLICY IF EXISTS "Allow service role profile creation" ON profiles;

-- Create a simple policy for service role only
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);
