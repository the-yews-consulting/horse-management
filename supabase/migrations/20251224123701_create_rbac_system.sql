/*
  # Role-Based Access Control (RBAC) System

  ## Overview
  Implements a comprehensive RBAC system with profiles table, role management,
  and proper Row Level Security policies to control access at the database level.

  ## 1. Role Definitions
  Four-tier role hierarchy:
  - `super_admin` - Full system access (owner/overseer)
  - `admin` - Manage content/users, view analytics
  - `moderator` - Edit specific data, limited deletes
  - `user` - Standard user access (default)

  ## 2. New Tables
  
  ### `profiles`
  Stores user profile information and role assignments
  - `id` (uuid, primary key) - Links to auth.users.id
  - `email` (text) - User's email address
  - `full_name` (text) - User's full name
  - `role` (text) - User's role level
  - `is_active` (boolean) - Whether account is active
  - `created_at` (timestamptz) - When profile was created
  - `updated_at` (timestamptz) - Last update timestamp

  ## 3. Security
  - Enable RLS on profiles table
  - Users can view their own profile
  - Super admins can view all profiles
  - Only super admins can modify roles
  - Authenticated users can update their own non-role fields

  ## 4. Functions
  - `get_user_role()` - Returns the role of the current user
  - `is_super_admin()` - Checks if current user is super admin
  - `is_admin_or_higher()` - Checks if current user is admin or super admin

  ## 5. Triggers
  - Auto-create profile on user signup
  - Update timestamp trigger
*/

-- Create role enum type
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role user_role NOT NULL DEFAULT 'user',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_result user_role;
BEGIN
  SELECT role INTO user_role_result
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role_result, 'user'::user_role);
END;
$$;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN get_user_role() = 'super_admin';
END;
$$;

-- Helper function to check if user is admin or higher
CREATE OR REPLACE FUNCTION is_admin_or_higher()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN get_user_role() IN ('super_admin', 'admin');
END;
$$;

-- RLS Policies for profiles table

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Super admins and admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin_or_higher());

-- Users can update their own non-sensitive fields
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Only super admins can update any profile including roles
CREATE POLICY "Super admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Only super admins can insert profiles manually
CREATE POLICY "Super admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

-- Prevent profile deletion (soft delete via is_active instead)
CREATE POLICY "Prevent profile deletion"
  ON profiles FOR DELETE
  TO authenticated
  USING (false);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_or_higher() TO authenticated;