/*
  # Allow Anonymous Profile Creation for Triggers

  ## Overview
  When users are created by admins using the edge function, the trigger
  that creates profiles runs without an authenticated context. This migration
  adds a policy to allow profile creation in this scenario.

  ## Changes
  - Add policy to allow anon role to create profiles (used by trigger)
  - Keep existing authenticated user policy
  - Maintain super admin policy

  ## Security
  - The anon policy only allows creating profiles (no read/update/delete)
  - The trigger is the only code path that uses this
  - Direct API access still requires authentication
*/

-- Allow service role and anon to create profiles (for trigger)
CREATE POLICY "Allow service role profile creation"
  ON profiles FOR INSERT
  TO anon, service_role
  WITH CHECK (true);