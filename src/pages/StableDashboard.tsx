import { Activity, Users, Warehouse } from 'lucide-react';
import { HorseHead } from '../components/HorseHeadIcon';
import { useState, useEffect } from 'react';
import { getHorses, getStalls, getOwners } from '../services/api';

export function StableDashboard() {
  const [stats, setStats] = useState({
    horses: 0,
    stalls: 0,
    owners: 0,
    occupancyRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [horses, stalls, owners] = await Promise.all([
          getHorses(),
          getStalls(),
          getOwners()
        ]);

        const occupiedStalls = stalls.filter(s => s.status === 'occupied').length;
        const occupancyRate = stalls.length > 0
          ? Math.round((occupiedStalls / stalls.length) * 100)
          : 0;

        setStats({
          horses: horses.length,
          stalls: stalls.length,
          owners: owners.length,
          occupancyRate
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your stable management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Horses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.horses}
              </p>
            </div>
            <HorseHead className="h-12 w-12 text-green-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stables</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.stalls}
              </p>
            </div>
            <Warehouse className="h-12 w-12 text-blue-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Owners</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.owners}
              </p>
            </div>
            <Users className="h-12 w-12 text-amber-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : `${stats.occupancyRate}%`}
              </p>
            </div>
            <Activity className="h-12 w-12 text-orange-600 opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to StableManager</h2>
        <p className="text-gray-600">
          This is your central hub for managing horses, stalls, owners, and activities. Use the sidebar to navigate to different sections.
        </p>
      </div>
    </div>
  );
}
