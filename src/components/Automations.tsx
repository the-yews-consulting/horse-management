import { useState, useEffect } from 'react';
import { Zap, Play, Square, RefreshCw } from 'lucide-react';
import { useHomeAssistant } from '../contexts/HomeAssistantContext';

interface Automation {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    last_triggered?: string;
    mode?: string;
    current?: number;
    max?: number;
  };
}

export function Automations() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const { callService } = useHomeAssistant();

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/automations');
      const data = await response.json();
      setAutomations(data);
    } catch (error) {
      console.error('Failed to load automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (entityId: string, currentState: string) => {
    try {
      const service = currentState === 'on' ? 'turn_off' : 'turn_on';
      await callService('automation', service, { entity_id: entityId });
      await loadAutomations();
    } catch (error) {
      console.error('Failed to toggle automation:', error);
    }
  };

  const handleTrigger = async (entityId: string) => {
    try {
      await callService('automation', 'trigger', { entity_id: entityId });
      await loadAutomations();
    } catch (error) {
      console.error('Failed to trigger automation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Automations</h2>
        </div>
        <button
          onClick={loadAutomations}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {automations.length === 0 ? (
          <div className="p-12 text-center">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No automations found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {automations.map(automation => (
              <div
                key={automation.entity_id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {automation.attributes.friendly_name || automation.entity_id}
                      </h3>
                      {automation.state === 'on' ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                          Enabled
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{automation.entity_id}</p>
                    {automation.attributes.last_triggered && (
                      <p className="text-sm text-gray-500 mt-2">
                        Last triggered: {new Date(automation.attributes.last_triggered).toLocaleString()}
                      </p>
                    )}
                    {automation.attributes.mode && (
                      <p className="text-sm text-gray-500">
                        Mode: {automation.attributes.mode}
                        {automation.attributes.max && ` (max: ${automation.attributes.max})`}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleTrigger(automation.entity_id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Trigger Now"
                    >
                      <Play className="h-4 w-4" />
                      Trigger
                    </button>
                    <button
                      onClick={() => handleToggle(automation.entity_id, automation.state)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        automation.state === 'on'
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      title={automation.state === 'on' ? 'Disable' : 'Enable'}
                    >
                      {automation.state === 'on' ? (
                        <>
                          <Square className="h-4 w-4" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Enable
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
