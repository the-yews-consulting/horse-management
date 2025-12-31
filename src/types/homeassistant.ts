export interface EntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

export type EntityDomain =
  | 'light'
  | 'switch'
  | 'climate'
  | 'cover'
  | 'fan'
  | 'sensor'
  | 'binary_sensor'
  | 'lock'
  | 'media_player'
  | 'camera'
  | 'automation'
  | 'script';

export interface DomainConfig {
  icon: string;
  color: string;
  label: string;
}
