/*
  # Base Schema Migration - Horse Stable Management System

  This migration creates all core tables needed for the horse stable management system.

  ## Tables Created
  1. profiles - User profiles with roles and account status
  2. team_members - Staff members working at the stable
  3. owners - Horse owners
  4. vets - Veterinarians
  5. farriers - Farriers/blacksmiths
  6. horses - Horse records
  7. stalls - Stall/stable locations
  8. boarding_assignments - Horse-to-stall assignments
  9. activities - Scheduled activities for horses
  10. activity_history - Activity history tracking
  11. alerts - Active alerts
  12. alert_history - Alert history
  13. config - System configuration

  ## Security
  - RLS enabled on all tables
  - Basic policies for authenticated users

  ## Enums
  - user_role: super_admin, admin, moderator, user
  - account_status: pending, enabled, disabled
*/

-- =============================================
-- ENUMS
-- =============================================

-- User role enum
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'moderator', 'user');

-- Account status enum
CREATE TYPE account_status AS ENUM ('pending', 'enabled', 'disabled');

-- =============================================
-- TRIGGER FUNCTION
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CORE TABLES
-- =============================================

-- Profiles table - extends auth.users
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role user_role NOT NULL DEFAULT 'user',
  is_active boolean DEFAULT true,
  account_status account_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team members table
CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text NOT NULL,
  is_active boolean DEFAULT true,
  hire_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Owners table
CREATE TABLE owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  billing_info text,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vets table
CREATE TABLE vets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  clinic_name text,
  email text,
  phone text,
  emergency_phone text,
  address text,
  mobile_phone text,
  office_phone text,
  bank_account_name text,
  bank_account_number text,
  bank_routing_number text,
  banking_details text,
  specialties text,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Farriers table
CREATE TABLE farriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  mobile_phone text,
  office_phone text,
  bank_account_name text,
  bank_account_number text,
  bank_routing_number text,
  banking_details text,
  service_areas text,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Horses table
CREATE TABLE horses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  pet_name text,
  breed text,
  color text,
  colour text,
  gender text,
  age integer,
  height numeric,
  date_of_birth date,
  microchip_id text,
  rfid text,
  registration_number text,
  passport_number text,
  fei_id text,
  status text DEFAULT 'active',
  medical_notes text,
  dietary_requirements text,
  behavioral_notes text,
  inquiry_notes text,
  photo_url text,
  markings_image text,
  clipped boolean DEFAULT false,
  rug_name text,
  sire text,
  dam text,
  bloodline_info text,
  breeding_status text,
  breeding_notes text,
  competition_record text,
  training_notes text,
  video_urls text,
  related_links text,
  owner_id uuid REFERENCES owners(id) ON DELETE SET NULL,
  vet_id uuid REFERENCES vets(id) ON DELETE SET NULL,
  farrier_id uuid REFERENCES farriers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stalls table
CREATE TABLE stalls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  building text,
  size text,
  size_sqm numeric,
  has_paddock_access boolean DEFAULT false,
  features text,
  status text DEFAULT 'available',
  notes text,
  barn_id uuid,
  paddock_id uuid,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Boarding assignments table
CREATE TABLE boarding_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id uuid REFERENCES horses(id) ON DELETE CASCADE,
  stall_id uuid REFERENCES stalls(id) ON DELETE SET NULL,
  boarding_type text NOT NULL,
  monthly_rate numeric(10,2),
  start_date date NOT NULL,
  end_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activities table
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id uuid REFERENCES horses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  activity_type text NOT NULL,
  scheduled_date date,
  scheduled_time time,
  duration_minutes integer,
  assigned_to text,
  status text DEFAULT 'pending',
  notes text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activity history table
CREATE TABLE activity_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  action text NOT NULL,
  changes jsonb,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_at timestamptz DEFAULT now()
);

-- Alerts table
CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id uuid REFERENCES horses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  alert_type text NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'active',
  due_date date,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Alert history table
CREATE TABLE alert_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES alerts(id) ON DELETE CASCADE,
  action text NOT NULL,
  changes jsonb,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_at timestamptz DEFAULT now()
);

-- Config table
CREATE TABLE config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_account_status ON profiles(account_status);

-- Team members indexes
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_members_is_active ON team_members(is_active);

-- Owners indexes
CREATE INDEX idx_owners_user_id ON owners(user_id);
CREATE INDEX idx_owners_email ON owners(email);
CREATE INDEX idx_owners_name ON owners(name);

-- Vets indexes
CREATE INDEX idx_vets_user_id ON vets(user_id);
CREATE INDEX idx_vets_name ON vets(name);

-- Farriers indexes
CREATE INDEX idx_farriers_user_id ON farriers(user_id);
CREATE INDEX idx_farriers_name ON farriers(name);

-- Horses indexes
CREATE INDEX idx_horses_name ON horses(name);
CREATE INDEX idx_horses_owner_id ON horses(owner_id);
CREATE INDEX idx_horses_vet_id ON horses(vet_id);
CREATE INDEX idx_horses_farrier_id ON horses(farrier_id);
CREATE INDEX idx_horses_status ON horses(status);
CREATE INDEX idx_horses_microchip_id ON horses(microchip_id);

-- Stalls indexes
CREATE INDEX idx_stalls_name ON stalls(name);
CREATE INDEX idx_stalls_status ON stalls(status);
CREATE INDEX idx_stalls_barn_id ON stalls(barn_id);

-- Boarding assignments indexes
CREATE INDEX idx_boarding_assignments_horse_id ON boarding_assignments(horse_id);
CREATE INDEX idx_boarding_assignments_stall_id ON boarding_assignments(stall_id);
CREATE INDEX idx_boarding_assignments_start_date ON boarding_assignments(start_date);
CREATE INDEX idx_boarding_assignments_end_date ON boarding_assignments(end_date);

-- Activities indexes
CREATE INDEX idx_activities_horse_id ON activities(horse_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_scheduled_date ON activities(scheduled_date);
CREATE INDEX idx_activities_activity_type ON activities(activity_type);

-- Activity history indexes
CREATE INDEX idx_activity_history_activity_id ON activity_history(activity_id);
CREATE INDEX idx_activity_history_performed_by ON activity_history(performed_by);

-- Alerts indexes
CREATE INDEX idx_alerts_horse_id ON alerts(horse_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_priority ON alerts(priority);
CREATE INDEX idx_alerts_due_date ON alerts(due_date);

-- Alert history indexes
CREATE INDEX idx_alert_history_alert_id ON alert_history(alert_id);
CREATE INDEX idx_alert_history_performed_by ON alert_history(performed_by);

-- Config indexes
CREATE INDEX idx_config_key ON config(key);

-- =============================================
-- TRIGGERS
-- =============================================

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON owners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vets_updated_at BEFORE UPDATE ON vets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farriers_updated_at BEFORE UPDATE ON farriers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_horses_updated_at BEFORE UPDATE ON horses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stalls_updated_at BEFORE UPDATE ON stalls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boarding_assignments_updated_at BEFORE UPDATE ON boarding_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE vets ENABLE ROW LEVEL SECURITY;
ALTER TABLE farriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE boarding_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - PROFILES
-- =============================================

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- =============================================
-- RLS POLICIES - TEAM MEMBERS
-- =============================================

CREATE POLICY "Authenticated users can view team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- RLS POLICIES - OWNERS
-- =============================================

CREATE POLICY "Authenticated users can view owners"
  ON owners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage owners"
  ON owners FOR ALL
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES - VETS
-- =============================================

CREATE POLICY "Authenticated users can view vets"
  ON vets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage vets"
  ON vets FOR ALL
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES - FARRIERS
-- =============================================

CREATE POLICY "Authenticated users can view farriers"
  ON farriers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage farriers"
  ON farriers FOR ALL
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES - HORSES
-- =============================================

CREATE POLICY "Authenticated users can view horses"
  ON horses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage horses"
  ON horses FOR ALL
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES - STALLS
-- =============================================

CREATE POLICY "Authenticated users can view stalls"
  ON stalls FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage stalls"
  ON stalls FOR ALL
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES - BOARDING ASSIGNMENTS
-- =============================================

CREATE POLICY "Authenticated users can view boarding assignments"
  ON boarding_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage boarding assignments"
  ON boarding_assignments FOR ALL
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES - ACTIVITIES
-- =============================================

CREATE POLICY "Authenticated users can view activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage activities"
  ON activities FOR ALL
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES - ACTIVITY HISTORY
-- =============================================

CREATE POLICY "Authenticated users can view activity history"
  ON activity_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activity history"
  ON activity_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- RLS POLICIES - ALERTS
-- =============================================

CREATE POLICY "Authenticated users can view alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage alerts"
  ON alerts FOR ALL
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES - ALERT HISTORY
-- =============================================

CREATE POLICY "Authenticated users can view alert history"
  ON alert_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert alert history"
  ON alert_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- RLS POLICIES - CONFIG
-- =============================================

CREATE POLICY "Authenticated users can view config"
  ON config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage config"
  ON config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
