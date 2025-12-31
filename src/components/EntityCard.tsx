import { HassEntity } from 'home-assistant-js-websocket';
import { useHomeAssistant } from '../contexts/HomeAssistantContext';
import {
  getEntityName,
  getEntityDomain,
  isEntityOn,
  canToggleEntity,
  formatEntityState,
} from '../utils/entityHelpers';
import {
  Lightbulb,
  ToggleLeft,
  Thermometer,
  Fan,
  Activity,
  Lock,
  Tv,
  Camera,
  Zap,
  Play,
  HelpCircle,
  Radio,
  Power,
} from 'lucide-react';

interface EntityCardProps {
  entity: HassEntity;
}

const iconMap: Record<string, any> = {
  Lightbulb,
  ToggleLeft,
  Thermometer,
  Fan,
  Activity,
  Lock,
  Tv,
  Camera,
  Zap,
  Play,
  HelpCircle,
  Radio,
};

export function EntityCard({ entity }: EntityCardProps) {
  const { callService } = useHomeAssistant();
  const domain = getEntityDomain(entity.entity_id);
  const name = getEntityName(entity);
  const state = formatEntityState(entity);
  const isOn = isEntityOn(entity);
  const canToggle = canToggleEntity(entity);

  const handleToggle = async () => {
    if (!canToggle) return;

    try {
      const service = isOn ? 'turn_off' : 'turn_on';
      await callService(domain, service, { entity_id: entity.entity_id });
    } catch (err) {
      console.error('Failed to toggle entity:', err);
    }
  };

  const getIconComponent = () => {
    const domain = getEntityDomain(entity.entity_id);
    const domainIcons: Record<string, any> = {
      light: Lightbulb,
      switch: Power,
      climate: Thermometer,
      fan: Fan,
      sensor: Activity,
      binary_sensor: Radio,
      lock: Lock,
      media_player: Tv,
      camera: Camera,
      automation: Zap,
      script: Play,
    };

    const IconComponent = domainIcons[domain] || HelpCircle;
    return IconComponent;
  };

  const IconComponent = getIconComponent();

  const getDomainColor = () => {
    if (!isOn) return 'bg-gray-100 text-gray-400';

    const colors: Record<string, string> = {
      light: 'bg-yellow-100 text-yellow-600',
      switch: 'bg-blue-100 text-blue-600',
      climate: 'bg-orange-100 text-orange-600',
      fan: 'bg-cyan-100 text-cyan-600',
      lock: 'bg-red-100 text-red-600',
      media_player: 'bg-purple-100 text-purple-600',
    };

    return colors[domain] || 'bg-green-100 text-green-600';
  };

  const getCardClass = () => {
    if (canToggle) {
      return `cursor-pointer hover:shadow-md active:scale-[0.98]`;
    }
    return '';
  };

  return (
    <div
      onClick={canToggle ? handleToggle : undefined}
      className={`bg-white rounded-xl p-6 shadow-sm transition-all ${getCardClass()} ${
        isOn && canToggle ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getDomainColor()}`}>
          <IconComponent className="h-6 w-6" />
        </div>
        {canToggle && (
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isOn ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isOn ? 'ON' : 'OFF'}
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{name}</h3>
      <p className="text-sm text-gray-600">{state}</p>

      {entity.attributes.brightness && isOn && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(entity.attributes.brightness / 255) * 100}%` }}
            />
          </div>
        </div>
      )}

      {entity.attributes.temperature && domain === 'climate' && (
        <div className="mt-3 text-sm text-gray-500">
          Target: {entity.attributes.temperature}°
        </div>
      )}
    </div>
  );
}
