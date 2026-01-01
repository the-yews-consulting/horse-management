import { useState, useMemo, useEffect } from 'react';
import { useHomeAssistant } from '../contexts/HomeAssistantContext';
import { EntityCard } from '../components/EntityCard';
import { SensorTable } from '../components/SensorTable';
import { Alerts } from '../components/Alerts';
import { Automations } from '../components/Automations';
import { Settings } from '../components/Settings';
import { getEntityDomain, filterSensors } from '../utils/entityHelpers';
import {
  Home,
  Lightbulb,
  Power,
  Thermometer,
  Activity,
  LayoutGrid,
  Search,
  RefreshCw,
  Table,
  Grid3x3,
  Bell,
  Zap,
  Settings as SettingsIcon,
} from 'lucide-react';

type ViewMode = 'cards' | 'sensors' | 'alerts' | 'automations' | 'settings';

export function Dashboard() {
  const { entities, refreshEntities } = useHomeAssistant();
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const entityList = useMemo(() => {
    return Object.values(entities);
  }, [entities]);

  const sensors = useMemo(() => {
    return filterSensors(entityList);
  }, [entityList]);

  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entityList.forEach((entity) => {
      const domain = getEntityDomain(entity.entity_id);
      counts[domain] = (counts[domain] || 0) + 1;
    });
    return counts;
  }, [entityList]);

  const filteredEntities = useMemo(() => {
    return entityList.filter((entity) => {
      const matchesDomain =
        selectedDomain === 'all' || getEntityDomain(entity.entity_id) === selectedDomain;

      const matchesSearch =
        searchQuery === '' ||
        entity.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.attributes.friendly_name?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDomain && matchesSearch;
    });
  }, [entityList, selectedDomain, searchQuery]);

  const domainFilters = [
    { id: 'all', label: 'All', icon: LayoutGrid, count: entityList.length },
    { id: 'light', label: 'Lights', icon: Lightbulb, count: domainCounts.light || 0 },
    { id: 'switch', label: 'Switches', icon: Power, count: domainCounts.switch || 0 },
    { id: 'climate', label: 'Climate', icon: Thermometer, count: domainCounts.climate || 0 },
    { id: 'sensor', label: 'Sensors', icon: Activity, count: domainCounts.sensor || 0 },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshEntities();
      setLastRefresh(new Date());
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    setLastRefresh(new Date());
  }, [entities]);

  if (entityList.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Entities Found</h2>
          <p className="text-gray-600">
            Waiting for entities to load from your Home Assistant instance...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('sensors')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'sensors'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Table className="h-4 w-4" />
              <span>Sensors</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  viewMode === 'sensors'
                    ? 'bg-blue-700 text-blue-100'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {sensors.length}
              </span>
            </button>
            <button
              onClick={() => setViewMode('alerts')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'alerts'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>Alerts</span>
            </button>
            <button
              onClick={() => setViewMode('automations')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'automations'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Automations</span>
            </button>
            <button
              onClick={() => setViewMode('settings')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'settings'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>

          {(viewMode === 'cards' || viewMode === 'sensors') && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {viewMode === 'cards' && (
          <>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {domainFilters.map((filter) => {
                if (filter.count === 0 && filter.id !== 'all') return null;

                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedDomain(filter.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                      selectedDomain === filter.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <filter.icon className="h-4 w-4" />
                    <span>{filter.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        selectedDomain === filter.id
                          ? 'bg-blue-700 text-blue-100'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {(viewMode === 'cards' || viewMode === 'sensors') && (
          <div className="mt-4 text-xs text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()} (real-time updates via WebSocket)
          </div>
        )}
      </div>

      {viewMode === 'settings' ? (
        <Settings />
      ) : viewMode === 'alerts' ? (
        <Alerts entities={entityList.map(e => e.entity_id)} />
      ) : viewMode === 'automations' ? (
        <Automations />
      ) : viewMode === 'sensors' ? (
        <SensorTable sensors={sensors} />
      ) : (
        <>
          {filteredEntities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No entities found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEntities.map((entity) => (
                <EntityCard key={entity.entity_id} entity={entity} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
