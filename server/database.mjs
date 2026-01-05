import { supabase } from './supabase.mjs';
import crypto from 'crypto';

const dbReady = Promise.resolve();
export { dbReady };

export async function getConfig(key) {
  const { data, error } = await supabase
    .from('config')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) throw error;
  return data ? data.value : null;
}

export async function setConfig(key, value) {
  const { error } = await supabase
    .from('config')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) throw error;
  return true;
}

export async function deleteConfig(key) {
  const { error } = await supabase
    .from('config')
    .delete()
    .eq('key', key);

  if (error) throw error;
  return true;
}

export async function getAllAlerts() {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createAlert(alert) {
  const { data, error } = await supabase
    .from('alerts')
    .insert({
      entity_id: alert.entity_id,
      condition: alert.condition,
      threshold: alert.threshold,
      message: alert.message || '',
      enabled: alert.enabled !== false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAlert(id, alert) {
  const { error } = await supabase
    .from('alerts')
    .update({
      entity_id: alert.entity_id,
      condition: alert.condition,
      threshold: alert.threshold,
      message: alert.message || '',
      enabled: alert.enabled !== false
    })
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function deleteAlert(id) {
  const { error } = await supabase
    .from('alerts')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function recordAlertTrigger(alertId, entityId, stateValue) {
  const { error } = await supabase
    .from('alert_history')
    .insert({
      alert_id: alertId,
      entity_id: entityId,
      state_value: stateValue
    });

  if (error) throw error;
  return true;
}

export async function getAlertHistory(limit = 50) {
  const { data, error } = await supabase
    .from('alert_history')
    .select(`
      *,
      alert:alerts(*)
    `)
    .order('triggered_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.map(row => ({
    ...row,
    alert_name: row.alert?.message || ''
  }));
}

export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createUser(user) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: Math.random().toString(36),
    email_confirm: true,
    user_metadata: {
      full_name: user.full_name,
      role: user.role,
      phone: user.phone
    }
  });

  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      });

    if (profileError) throw profileError;
  }

  return {
    id: data.user.id,
    email: user.email,
    password_hash: user.password_hash,
    full_name: user.full_name,
    role: user.role,
    phone: user.phone
  };
}

export async function updateUser(id, user) {
  const { error } = await supabase
    .from('profiles')
    .update({
      email: user.email,
      full_name: user.full_name,
      role: user.role
    })
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function deleteUser(id) {
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) throw error;
  return true;
}

export async function createOwner(owner) {
  const { data, error } = await supabase
    .from('owners')
    .insert({
      name: `${owner.first_name} ${owner.last_name}`,
      first_name: owner.first_name,
      last_name: owner.last_name,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      emergency_contact_name: owner.emergency_contact_name,
      emergency_contact_phone: owner.emergency_contact_phone,
      billing_info: owner.billing_info,
      notes: owner.notes
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllOwners() {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getOwnerById(id) {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateOwner(id, owner) {
  const { error } = await supabase
    .from('owners')
    .update({
      name: `${owner.first_name} ${owner.last_name}`,
      first_name: owner.first_name,
      last_name: owner.last_name,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      emergency_contact_name: owner.emergency_contact_name,
      emergency_contact_phone: owner.emergency_contact_phone,
      billing_info: owner.billing_info,
      notes: owner.notes
    })
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function deleteOwner(id) {
  const { error } = await supabase
    .from('owners')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function createHorse(horse) {
  const { data, error } = await supabase
    .from('horses')
    .insert({
      name: horse.name,
      breed: horse.breed,
      color: horse.color || horse.colour,
      age: horse.age,
      date_of_birth: horse.date_of_birth,
      gender: horse.gender,
      owner_id: horse.owner_id,
      vet_id: horse.vet_id,
      farrier_id: horse.farrier_id,
      microchip_id: horse.microchip_number,
      passport_number: horse.passport_number,
      medical_notes: horse.medical_notes,
      dietary_requirements: horse.dietary_requirements,
      behavioral_notes: horse.behavioral_notes,
      photo_url: horse.photo_url,
      status: horse.status || 'active',
      colour: horse.colour,
      height: horse.height,
      clipped: horse.clipped || false,
      fei_id: horse.fei_id,
      pet_name: horse.pet_name,
      rfid: horse.rfid,
      rug_name: horse.rug_name,
      sire: horse.sire,
      dam: horse.dam,
      bloodline_info: horse.bloodline_info,
      breeding_status: horse.breeding_status,
      breeding_notes: horse.breeding_notes,
      inquiry_notes: horse.inquiry_notes,
      competition_record: horse.competition_record,
      training_notes: horse.training_notes,
      video_urls: horse.video_urls,
      related_links: horse.related_links,
      markings_image: horse.markings_image
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllHorses() {
  const { data, error } = await supabase
    .from('horses')
    .select(`
      *,
      owner:owners(first_name, last_name),
      vet:vets(name),
      farrier:farriers(name)
    `)
    .order('name', { ascending: true });

  if (error) throw error;
  return data.map(horse => ({
    ...horse,
    owner_first_name: horse.owner?.first_name,
    owner_last_name: horse.owner?.last_name,
    vet_name: horse.vet?.name,
    farrier_name: horse.farrier?.name
  }));
}

export async function getHorseById(id) {
  const { data, error } = await supabase
    .from('horses')
    .select(`
      *,
      owner:owners(first_name, last_name),
      vet:vets(name),
      farrier:farriers(name)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (data) {
    return {
      ...data,
      owner_first_name: data.owner?.first_name,
      owner_last_name: data.owner?.last_name,
      vet_name: data.vet?.name,
      farrier_name: data.farrier?.name
    };
  }
  return null;
}

export async function updateHorse(id, horse) {
  console.log('updateHorse called with id:', id, 'data:', horse);
  const { data, error } = await supabase
    .from('horses')
    .update({
      name: horse.name,
      breed: horse.breed,
      color: horse.color || horse.colour,
      age: horse.age,
      date_of_birth: horse.date_of_birth,
      gender: horse.gender,
      owner_id: horse.owner_id,
      vet_id: horse.vet_id,
      farrier_id: horse.farrier_id,
      microchip_id: horse.microchip_number,
      passport_number: horse.passport_number,
      medical_notes: horse.medical_notes,
      dietary_requirements: horse.dietary_requirements,
      behavioral_notes: horse.behavioral_notes,
      photo_url: horse.photo_url,
      status: horse.status,
      colour: horse.colour,
      height: horse.height,
      clipped: horse.clipped || false,
      fei_id: horse.fei_id,
      pet_name: horse.pet_name,
      rfid: horse.rfid,
      rug_name: horse.rug_name,
      sire: horse.sire,
      dam: horse.dam,
      bloodline_info: horse.bloodline_info,
      breeding_status: horse.breeding_status,
      breeding_notes: horse.breeding_notes,
      inquiry_notes: horse.inquiry_notes,
      competition_record: horse.competition_record,
      training_notes: horse.training_notes,
      video_urls: horse.video_urls,
      related_links: horse.related_links,
      markings_image: horse.markings_image
    })
    .eq('id', id)
    .select();

  console.log('Supabase update result - data:', data, 'error:', error);
  if (error) throw error;
  return true;
}

export async function deleteHorse(id) {
  const { error } = await supabase
    .from('horses')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function createStall(stall) {
  const { data, error } = await supabase
    .from('stalls')
    .insert({
      name: stall.name,
      building: stall.building,
      size: stall.size_sqm,
      size_sqm: stall.size_sqm,
      has_paddock_access: stall.has_paddock_access || false,
      features: stall.features,
      status: stall.status || 'available',
      notes: stall.notes
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllStalls() {
  const { data, error } = await supabase
    .from('stalls')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getStallById(id) {
  const { data, error } = await supabase
    .from('stalls')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateStall(id, stall) {
  const { error } = await supabase
    .from('stalls')
    .update({
      name: stall.name,
      building: stall.building,
      size: stall.size_sqm,
      size_sqm: stall.size_sqm,
      has_paddock_access: stall.has_paddock_access || false,
      features: stall.features,
      status: stall.status,
      notes: stall.notes
    })
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function deleteStall(id) {
  const { error } = await supabase
    .from('stalls')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function createVet(vet) {
  const { data, error } = await supabase
    .from('vets')
    .insert({
      name: vet.name,
      clinic_name: vet.clinic_name,
      email: vet.email,
      phone: vet.phone,
      address: vet.address,
      emergency_phone: vet.emergency_phone,
      banking_details: vet.banking_details,
      specialties: vet.specialties,
      notes: vet.notes
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllVets() {
  const { data, error } = await supabase
    .from('vets')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getVetById(id) {
  const { data, error } = await supabase
    .from('vets')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateVet(id, vet) {
  const { error } = await supabase
    .from('vets')
    .update({
      name: vet.name,
      clinic_name: vet.clinic_name,
      email: vet.email,
      phone: vet.phone,
      address: vet.address,
      emergency_phone: vet.emergency_phone,
      banking_details: vet.banking_details,
      specialties: vet.specialties,
      notes: vet.notes
    })
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function deleteVet(id) {
  const { error } = await supabase
    .from('vets')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function createFarrier(farrier) {
  const { data, error } = await supabase
    .from('farriers')
    .insert({
      name: farrier.name,
      email: farrier.email,
      phone: farrier.phone,
      address: farrier.address,
      banking_details: farrier.banking_details,
      service_areas: farrier.service_areas,
      notes: farrier.notes
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllFarriers() {
  const { data, error} = await supabase
    .from('farriers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getFarrierById(id) {
  const { data, error } = await supabase
    .from('farriers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateFarrier(id, farrier) {
  const { error } = await supabase
    .from('farriers')
    .update({
      name: farrier.name,
      email: farrier.email,
      phone: farrier.phone,
      address: farrier.address,
      banking_details: farrier.banking_details,
      service_areas: farrier.service_areas,
      notes: farrier.notes
    })
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function deleteFarrier(id) {
  const { error } = await supabase
    .from('farriers')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function createActivity(activity) {
  const { data, error } = await supabase
    .from('activities')
    .insert({
      title: activity.title,
      activity_type: activity.activity_type,
      horse_id: activity.horse_id,
      user_id: activity.assigned_to,
      scheduled_date: activity.scheduled_start,
      scheduled_time: activity.scheduled_start,
      duration_minutes: activity.duration_minutes,
      assigned_to: activity.assigned_to,
      status: activity.status || 'planned',
      notes: activity.notes,
      description: activity.description || ''
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      horse:horses(name),
      user:profiles(full_name)
    `)
    .order('scheduled_date', { ascending: false });

  if (error) throw error;
  return data.map(activity => ({
    ...activity,
    horse_name: activity.horse?.name,
    assigned_to_name: activity.user?.full_name,
    scheduled_start: activity.scheduled_date
  }));
}

export async function getActivityById(id) {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      horse:horses(name),
      user:profiles(full_name)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (data) {
    return {
      ...data,
      horse_name: data.horse?.name,
      assigned_to_name: data.user?.full_name,
      scheduled_start: data.scheduled_date
    };
  }
  return null;
}

export async function updateActivity(id, activity) {
  const { error } = await supabase
    .from('activities')
    .update({
      title: activity.title,
      activity_type: activity.activity_type,
      horse_id: activity.horse_id,
      scheduled_date: activity.scheduled_start,
      scheduled_time: activity.scheduled_start,
      assigned_to: activity.assigned_to,
      status: activity.status,
      notes: activity.notes,
      description: activity.description || ''
    })
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function deleteActivity(id) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function createBoardingAssignment(assignment) {
  const { data, error } = await supabase
    .from('boarding_assignments')
    .insert({
      horse_id: assignment.horse_id,
      stall_id: assignment.stall_id,
      boarding_type: assignment.boarding_type || 'full',
      start_date: assignment.start_date,
      end_date: assignment.end_date,
      monthly_rate: assignment.monthly_rate,
      notes: assignment.notes
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getActiveAssignmentsByStallId(stallId) {
  const { data, error } = await supabase
    .from('boarding_assignments')
    .select(`
      *,
      horse:horses(name)
    `)
    .eq('stall_id', stallId)
    .or(`end_date.is.null,end_date.gte.${new Date().toISOString().split('T')[0]}`)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data.map(assignment => ({
    ...assignment,
    horse_name: assignment.horse?.name
  }));
}

export async function getActiveAssignmentByHorseId(horseId) {
  const { data, error } = await supabase
    .from('boarding_assignments')
    .select(`
      *,
      stall:stalls(name, building)
    `)
    .eq('horse_id', horseId)
    .or(`end_date.is.null,end_date.gte.${new Date().toISOString().split('T')[0]}`)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data) {
    return {
      ...data,
      stall_name: data.stall?.name,
      building: data.stall?.building
    };
  }
  return null;
}

export async function getAllActiveBoardingAssignments() {
  const { data, error } = await supabase
    .from('boarding_assignments')
    .select(`
      *,
      horse:horses(name),
      stall:stalls(name, building)
    `)
    .or(`end_date.is.null,end_date.gte.${new Date().toISOString().split('T')[0]}`)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data.map(assignment => ({
    ...assignment,
    horse_name: assignment.horse?.name,
    stall_name: assignment.stall?.name,
    building: assignment.stall?.building
  }));
}

export async function linkSensorToStall(sensor) {
  const { data, error } = await supabase
    .from('ha_sensors')
    .insert({
      entity_id: sensor.entity_id,
      friendly_name: sensor.friendly_name,
      device_class: sensor.device_class,
      unit_of_measurement: sensor.unit_of_measurement,
      state: sensor.state,
      attributes: sensor.attributes || {}
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSensorsByStallId(stallId) {
  const { data, error } = await supabase
    .from('ha_sensors')
    .select('*')
    .order('friendly_name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function unlinkSensor(id) {
  const { error } = await supabase
    .from('ha_sensors')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function linkCameraToStall(camera) {
  return { id: crypto.randomUUID(), ...camera };
}

export async function getCamerasByStallId(stallId) {
  return [];
}

export async function unlinkCamera(id) {
  return true;
}

export const db = null;
