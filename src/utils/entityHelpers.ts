import { HassEntity } from 'home-assistant-js-websocket';
import { EntityDomain } from '../types/homeassistant';

export function getEntityDomain(entityId: string): string {
  return entityId.split('.')[0];
}

export function getEntityName(entity: HassEntity): string {
  return entity.attributes.friendly_name || entity.entity_id.split('.')[1].replace(/_/g, ' ');
}

export function isEntityOn(entity: HassEntity): boolean {
  const domain = getEntityDomain(entity.entity_id);

  if (domain === 'light' || domain === 'switch' || domain === 'fan') {
    return entity.state === 'on';
  }

  if (domain === 'binary_sensor') {
    return entity.state === 'on';
  }

  if (domain === 'cover') {
    return entity.state === 'open';
  }

  if (domain === 'lock') {
    return entity.state === 'unlocked';
  }

  return false;
}

export function canToggleEntity(entity: HassEntity): boolean {
  const domain = getEntityDomain(entity.entity_id);
  const toggleDomains = ['light', 'switch', 'fan', 'lock'];
  return toggleDomains.includes(domain);
}

export function getEntityIcon(entity: HassEntity): string {
  const domain = getEntityDomain(entity.entity_id);

  if (entity.attributes.icon) {
    return entity.attributes.icon;
  }

  const domainIcons: Record<string, string> = {
    light: 'Lightbulb',
    switch: 'ToggleLeft',
    climate: 'Thermometer',
    cover: 'Blinds',
    fan: 'Fan',
    sensor: 'Activity',
    binary_sensor: 'Radio',
    lock: 'Lock',
    media_player: 'Tv',
    camera: 'Camera',
    automation: 'Zap',
    script: 'Play',
  };

  return domainIcons[domain] || 'HelpCircle';
}

export function formatEntityState(entity: HassEntity): string {
  const domain = getEntityDomain(entity.entity_id);

  if (domain === 'sensor') {
    const unit = entity.attributes.unit_of_measurement || '';
    return `${entity.state} ${unit}`.trim();
  }

  if (domain === 'climate') {
    const temp = entity.attributes.current_temperature;
    const unit = entity.attributes.unit_of_measurement || '°C';
    return temp ? `${temp}${unit}` : entity.state;
  }

  return entity.state;
}

export function groupEntitiesByDomain(entities: HassEntity[]): Record<string, HassEntity[]> {
  return entities.reduce((groups, entity) => {
    const domain = getEntityDomain(entity.entity_id);
    if (!groups[domain]) {
      groups[domain] = [];
    }
    groups[domain].push(entity);
    return groups;
  }, {} as Record<string, HassEntity[]>);
}
