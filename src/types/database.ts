export interface Owner {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Horse {
  id: string;
  name: string;
  breed: string | null;
  color: string | null;
  date_of_birth: string | null;
  microchip_id: string | null;
  registration_number: string | null;
  medical_notes: string | null;
  dietary_requirements: string | null;
  owner_id: string | null;
  vet_id: string | null;
  farrier_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface HorseWithOwner extends Horse {
  owner?: Owner;
  vet?: Vet;
  farrier?: Farrier;
}

export interface Stall {
  id: string;
  name: string;
  building: string | null;
  size: string | null;
  has_paddock_access: boolean;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface BoardingAssignment {
  id: string;
  horse_id: string;
  stall_id: string;
  boarding_type: 'full' | 'partial' | 'training';
  monthly_rate: number;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BoardingAssignmentWithDetails extends BoardingAssignment {
  horse?: HorseWithOwner;
}

export interface StallWithAssignment extends Stall {
  current_assignment?: BoardingAssignmentWithDetails;
  is_occupied: boolean;
}

export interface Vet {
  id: string;
  name: string;
  address: string | null;
  mobile_phone: string | null;
  office_phone: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_routing_number: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Farrier {
  id: string;
  name: string;
  address: string | null;
  mobile_phone: string | null;
  office_phone: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_routing_number: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}
