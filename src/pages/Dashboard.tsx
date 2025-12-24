import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Home, Users, DoorOpen, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

interface DashboardStats {
  totalHorses: number;
  totalOwners: number;
  totalStalls: number;
  occupiedStalls: number;
  activeAlerts: number;
}

interface DashboardProps {
  onAddHorse: () => void;
  onAddStall: () => void;
  onNavigate: (view: 'horses' | 'owners' | 'stalls' | 'vets' | 'farriers') => void;
}

export function Dashboard({ onAddHorse, onAddStall, onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalHorses: 0,
    totalOwners: 0,
    totalStalls: 0,
    occupiedStalls: 0,
    activeAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const [horsesResult, ownersResult, stallsResult, assignmentsResult] = await Promise.all([
        supabase.from('horses').select('id', { count: 'exact', head: true }),
        supabase.from('owners').select('id', { count: 'exact', head: true }),
        supabase.from('stalls').select('id', { count: 'exact', head: true }),
        supabase.from('boarding_assignments').select('id', { count: 'exact', head: true }).is('end_date', null),
      ]);

      const totalHorses = horsesResult.count || 0;
      const totalOwners = ownersResult.count || 0;
      const totalStalls = stallsResult.count || 0;
      const occupiedStalls = assignmentsResult.count || 0;

      const activeAlerts = totalStalls - occupiedStalls > 5 ? 1 : 0;

      setStats({
        totalHorses,
        totalOwners,
        totalStalls,
        occupiedStalls,
        activeAlerts,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const occupancyRate = stats.totalStalls > 0
    ? Math.round((stats.occupiedStalls / stats.totalStalls) * 100)
    : 0;

  const vacantStalls = stats.totalStalls - stats.occupiedStalls;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your stable management system</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div
              onClick={() => onNavigate('horses')}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Horses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalHorses}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div
              onClick={() => onNavigate('owners')}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Owners</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOwners}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div
              onClick={() => onNavigate('stalls')}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stalls</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStalls}</p>
                </div>
                <div className="bg-amber-100 rounded-full p-3">
                  <DoorOpen className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupied Stalls</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.occupiedStalls}</p>
                  <p className="text-xs text-gray-500 mt-1">{occupancyRate}% occupancy</p>
                </div>
                <div className="bg-emerald-100 rounded-full p-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vacant Stalls</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{vacantStalls}</p>
                  <p className="text-xs text-gray-500 mt-1">Available now</p>
                </div>
                <div className="bg-slate-100 rounded-full p-3">
                  <DoorOpen className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Database Connection</span>
                  </div>
                  <span className="text-xs font-medium text-green-600">Online</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Stall Management</span>
                  </div>
                  <span className="text-xs font-medium text-green-600">Active</span>
                </div>

                {stats.activeAlerts > 0 ? (
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-medium text-gray-900">High Vacancy Rate</span>
                    </div>
                    <span className="text-xs font-medium text-amber-600">Alert</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Occupancy Level</span>
                    </div>
                    <span className="text-xs font-medium text-green-600">Normal</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onAddHorse}
                  className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add Horse</span>
                </button>

                <button
                  onClick={onAddStall}
                  className="flex items-center justify-center space-x-2 p-4 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors border border-amber-200"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add Stall</span>
                </button>

                <button
                  onClick={() => onNavigate('horses')}
                  className="flex items-center justify-center space-x-2 p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors border border-gray-200"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">View Horses</span>
                </button>

                <button
                  onClick={() => onNavigate('stalls')}
                  className="flex items-center justify-center space-x-2 p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors border border-gray-200"
                >
                  <DoorOpen className="h-5 w-5" />
                  <span className="font-medium">View Stalls</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Stable Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{occupancyRate}%</p>
                <p className="text-sm text-gray-600 mt-1">Stall Occupancy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.totalHorses}</p>
                <p className="text-sm text-gray-600 mt-1">Horses Managed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{vacantStalls}</p>
                <p className="text-sm text-gray-600 mt-1">Available Capacity</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
