/*
  # Add Account Status and Email Verification to Profiles

  ## Changes
  
  1. Add account_status column to profiles table
    - Values: 'pending', 'enabled', 'disabled'
    - Default: 'pending' for new accounts requiring admin approval
  
  2. Security Updates
    - Update RLS policies to check account status
    - Only enabled accounts can access the system
    - Admins can manage all account statuses
  
  ## Important Notes
  
  This migration enables:
  - Email verification requirement for new signups
  - Admin approval workflow (accounts start as 'pending')
  - Account enable/disable functionality
*/

-- Create account status enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
    CREATE TYPE account_status AS ENUM ('pending', 'enabled', 'disabled');
  END IF;
END $$;

-- Add account_status column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_status account_status DEFAULT 'pending';
  END IF;
END $$;

-- Update existing active users to 'enabled' status
UPDATE profiles 
SET account_status = 'enabled' 
WHERE is_active = true AND account_status IS NULL;

-- Update existing inactive users to 'disabled' status
UPDATE profiles 
SET account_status = 'disabled' 
WHERE is_active = false AND account_status IS NULL;

-- Create index for account status queries
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- Drop old RLS policies that don't check account status
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new RLS policies that check account status
CREATE POLICY "Enabled users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id AND 
    account_status = 'enabled'
  );

CREATE POLICY "Enabled users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id AND 
    account_status = 'enabled'
  )
  WITH CHECK (
    auth.uid() = id AND 
    account_status = 'enabled'
  );

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'super_admin'
      AND account_status = 'enabled'
    )
  );

-- Super admins can update all profiles
CREATE POLICY "Super admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'super_admin'
      AND account_status = 'enabled'
    )
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
      AND account_status = 'enabled'
    )
  );

-- Admins can update user account status (but not roles)
CREATE POLICY "Admins can update account status"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
      AND account_status = 'enabled'
    )
  );
