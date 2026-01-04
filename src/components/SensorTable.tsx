import { useMemo, useState } from 'react';
import { HassEntity } from '../types/homeassistant';
import { getEntityName, formatSensorValue, getEntityDomain } from '../utils/entityHelpers';
import { Activity, Clock, Search } from 'lucide-react';

interface SensorTableProps {
  sensors: HassEntity[];
}

export function SensorTable({ sensors }: SensorTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'value' | 'updated'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedSensors = useMemo(() => {
    let filtered = sensors.filter((sensor) => {
      if (!searchQuery) return true;
      const name = getEntityName(sensor).toLowerCase();
      const entityId = sensor.entity_id.toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query) || entityId.includes(query);
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = getEntityName(a).toLowerCase();
          bValue = getEntityName(b).toLowerCase();
          break;
        case 'value':
          aValue = a.state.toLowerCase();
          bValue = b.state.toLowerCase();
          break;
        case 'updated':
          aValue = new Date(a.last_updated).getTime();
          bValue = new Date(b.last_updated).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [sensors, searchQuery, sortField, sortDirection]);

  const handleSort = (field: 'name' | 'value' | 'updated') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (sensors.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sensors Found</h3>
        <p className="text-gray-600">No sensor entities available in your Home Assistant instance</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search sensors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Sensor Name</span>
                  {sortField === 'name' && (
                    <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort('value')}
              >
                <div className="flex items-center space-x-1">
                  <span>Current Value</span>
                  {sortField === 'value' && (
                    <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort('updated')}
              >
                <div className="flex items-center space-x-1">
                  <span>Last Updated</span>
                  {sortField === 'updated' && (
                    <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Entity ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedSensors.map((sensor) => {
              const domain = getEntityDomain(sensor.entity_id);
              const isUnavailable = sensor.state === 'unavailable' || sensor.state === 'unknown';

              return (
                <tr
                  key={sensor.entity_id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        domain === 'sensor'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {domain === 'sensor' ? 'Sensor' : 'Binary'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {getEntityName(sensor)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`text-sm font-semibold ${
                        isUnavailable ? 'text-red-600' : 'text-gray-900'
                      }`}
                    >
                      {formatSensorValue(sensor)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formatLastUpdated(sensor.last_updated)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {sensor.entity_id}
                    </code>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSortedSensors.length === 0 && searchQuery && (
        <div className="p-12 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No sensors found</h3>
          <p className="text-gray-600">Try adjusting your search query</p>
        </div>
      )}

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        Showing {filteredAndSortedSensors.length} of {sensors.length} sensors
      </div>
    </div>
  );
}
