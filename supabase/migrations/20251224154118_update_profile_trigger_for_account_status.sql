/*
  # Update Profile Creation Trigger for Account Status

  ## Changes
  
  1. Update handle_new_user() function to set account_status to 'pending'
    - New user accounts will require admin approval
    - Account status defaults to 'pending' instead of 'enabled'
  
  ## Important Notes
  
  This ensures that all new signups require admin approval before accessing the system.
*/

-- Update the trigger function to include account_status
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert the profile with the trigger's elevated privileges
  INSERT INTO public.profiles (id, email, full_name, role, account_status, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'::user_role,
    'pending'::account_status,
    true
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
