const API_BASE_URL = '/api';

export interface TokenConfig {
  token: string;
  url?: string;
}

export interface ConfigStatus {
  hasToken: boolean;
  url: string;
}

export interface VerifyResponse {
  success: boolean;
  error?: string;
}

export async function saveToken(config: TokenConfig): Promise<{ success: boolean; message?: string; error?: string }> {
  const response = await fetch(`${API_BASE_URL}/config/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  return await response.json();
}

export async function getTokenStatus(): Promise<ConfigStatus> {
  const response = await fetch(`${API_BASE_URL}/config/token`);
  return await response.json();
}

export async function deleteToken(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/config/token`, {
    method: 'DELETE',
  });
  return await response.json();
}

export async function verifyConnection(): Promise<VerifyResponse> {
  const response = await fetch(`${API_BASE_URL}/verify`);
  return await response.json();
}

export async function getStates(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/states`);
  if (!response.ok) {
    throw new Error('Failed to fetch states');
  }
  return await response.json();
}

export async function getState(entityId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/states/${entityId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch state');
  }
  return await response.json();
}

export async function callService(domain: string, service: string, data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/services/${domain}/${service}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to call service');
  }

  return await response.json();
}

export interface WebSocketConfig {
  url: string;
  token: string;
}

export async function getWebSocketConfig(): Promise<WebSocketConfig> {
  const response = await fetch(`${API_BASE_URL}/config/websocket`);
  if (!response.ok) {
    throw new Error('Failed to fetch WebSocket config');
  }
  return await response.json();
}

export interface Horse {
  id?: string;
  name: string;
  breed?: string;
  color?: string;
  age?: number;
  date_of_birth?: string;
  gender?: 'mare' | 'stallion' | 'gelding' | 'colt' | 'filly';
  owner_id?: string;
  vet_id?: string;
  farrier_id?: string;
  microchip_number?: string;
  passport_number?: string;
  medical_notes?: string;
  dietary_requirements?: string;
  behavioral_notes?: string;
  photo_url?: string;
  status?: 'active' | 'inactive' | 'sold' | 'deceased';
  colour?: 'Brown' | 'Bay' | 'Chesnut' | 'Grey' | 'Black';
  height?: number;
  clipped?: boolean;
  fei_id?: string;
  pet_name?: string;
  rfid?: string;
  rug_name?: string;
  sire?: string;
  dam?: string;
  bloodline_info?: string;
  breeding_status?: string;
  breeding_notes?: string;
  inquiry_notes?: string;
  competition_record?: string;
  training_notes?: string;
  video_urls?: string;
  related_links?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  vet_name?: string;
  farrier_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Stall {
  id?: string;
  name: string;
  building?: string;
  size_sqm?: number;
  has_paddock_access?: boolean;
  features?: string;
  status?: 'available' | 'occupied' | 'maintenance';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Owner {
  id?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  billing_info?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Vet {
  id?: string;
  name: string;
  clinic_name?: string;
  email?: string;
  phone: string;
  address?: string;
  emergency_phone?: string;
  banking_details?: string;
  specialties?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Farrier {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  banking_details?: string;
  service_areas?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getHorses(): Promise<Horse[]> {
  const response = await fetch(`${API_BASE_URL}/horses`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch horses');
  }
  return await response.json();
}

export async function getHorse(id: string): Promise<Horse> {
  const response = await fetch(`${API_BASE_URL}/horses/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch horse');
  }
  return await response.json();
}

export async function createHorse(horse: Horse): Promise<Horse> {
  const response = await fetch(`${API_BASE_URL}/horses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    },
    body: JSON.stringify(horse),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create horse');
  }

  return await response.json();
}

export async function updateHorse(id: string, horse: Horse): Promise<Horse> {
  const response = await fetch(`${API_BASE_URL}/horses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    },
    body: JSON.stringify(horse),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update horse');
  }

  return await response.json();
}

export async function deleteHorse(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/horses/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete horse');
  }

  return await response.json();
}

export async function getStalls(): Promise<Stall[]> {
  const response = await fetch(`${API_BASE_URL}/stalls`);
  if (!response.ok) {
    throw new Error('Failed to fetch stalls');
  }
  return await response.json();
}

export async function getStall(id: string): Promise<Stall> {
  const response = await fetch(`${API_BASE_URL}/stalls/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch stall');
  }
  return await response.json();
}

export async function createStall(stall: Stall): Promise<Stall> {
  const response = await fetch(`${API_BASE_URL}/stalls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stall),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create stall');
  }

  return await response.json();
}

export async function updateStall(id: string, stall: Stall): Promise<Stall> {
  const response = await fetch(`${API_BASE_URL}/stalls/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stall),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update stall');
  }

  return await response.json();
}

export async function deleteStall(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/stalls/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete stall');
  }

  return await response.json();
}

export async function getOwners(): Promise<Owner[]> {
  const response = await fetch(`${API_BASE_URL}/owners`);
  if (!response.ok) {
    throw new Error('Failed to fetch owners');
  }
  return await response.json();
}

export async function getOwner(id: string): Promise<Owner> {
  const response = await fetch(`${API_BASE_URL}/owners/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch owner');
  }
  return await response.json();
}

export async function createOwner(owner: Owner): Promise<Owner> {
  const response = await fetch(`${API_BASE_URL}/owners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(owner),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create owner');
  }

  return await response.json();
}

export async function updateOwner(id: string, owner: Owner): Promise<Owner> {
  const response = await fetch(`${API_BASE_URL}/owners/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(owner),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update owner');
  }

  return await response.json();
}

export async function deleteOwner(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/owners/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete owner');
  }

  return await response.json();
}

export async function getVets(): Promise<Vet[]> {
  const response = await fetch(`${API_BASE_URL}/vets`);
  if (!response.ok) {
    throw new Error('Failed to fetch vets');
  }
  return await response.json();
}

export async function getVet(id: string): Promise<Vet> {
  const response = await fetch(`${API_BASE_URL}/vets/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch vet');
  }
  return await response.json();
}

export async function createVet(vet: Vet): Promise<Vet> {
  const response = await fetch(`${API_BASE_URL}/vets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vet),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create vet');
  }

  return await response.json();
}

export async function updateVet(id: string, vet: Vet): Promise<Vet> {
  const response = await fetch(`${API_BASE_URL}/vets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vet),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update vet');
  }

  return await response.json();
}

export async function deleteVet(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/vets/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete vet');
  }

  return await response.json();
}

export async function getFarriers(): Promise<Farrier[]> {
  const response = await fetch(`${API_BASE_URL}/farriers`);
  if (!response.ok) {
    throw new Error('Failed to fetch farriers');
  }
  return await response.json();
}

export async function getFarrier(id: string): Promise<Farrier> {
  const response = await fetch(`${API_BASE_URL}/farriers/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch farrier');
  }
  return await response.json();
}

export async function createFarrier(farrier: Farrier): Promise<Farrier> {
  const response = await fetch(`${API_BASE_URL}/farriers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(farrier),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create farrier');
  }

  return await response.json();
}

export async function updateFarrier(id: string, farrier: Farrier): Promise<Farrier> {
  const response = await fetch(`${API_BASE_URL}/farriers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(farrier),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update farrier');
  }

  return await response.json();
}

export async function deleteFarrier(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/farriers/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete farrier');
  }

  return await response.json();
}

export interface Activity {
  id?: string;
  title: string;
  activity_type: 'feeding' | 'training' | 'vet_visit' | 'farrier_visit' | 'grooming' | 'exercise' | 'medication' | 'custom';
  horse_id?: string;
  stall_id?: string;
  assigned_to?: string;
  scheduled_start: string;
  scheduled_end?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  recurrence_rule?: string;
  horse_name?: string;
  stall_name?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getActivities(): Promise<Activity[]> {
  const response = await fetch(`${API_BASE_URL}/activities`);
  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }
  return await response.json();
}

export async function getActivity(id: string): Promise<Activity> {
  const response = await fetch(`${API_BASE_URL}/activities/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch activity');
  }
  return await response.json();
}

export async function createActivity(activity: Activity): Promise<Activity> {
  const response = await fetch(`${API_BASE_URL}/activities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(activity),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create activity');
  }

  return await response.json();
}

export async function updateActivity(id: string, activity: Activity): Promise<Activity> {
  const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(activity),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update activity');
  }

  return await response.json();
}

export async function deleteActivity(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete activity');
  }

  return await response.json();
}
