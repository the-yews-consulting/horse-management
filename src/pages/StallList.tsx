import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StallWithAssignment } from '../types/database';
import { Search, Plus, Edit, Trash2, Eye, Loader2, DoorOpen, DoorClosed, CheckCircle2 } from 'lucide-react';

interface StallListProps {
  onAddStall: () => void;
  onEditStall: (stall: StallWithAssignment) => void;
  onViewStall: (stall: StallWithAssignment) => void;
  onDeleteStall: (stall: StallWithAssignment) => void;
}

export function StallList({ onAddStall, onEditStall, onViewStall, onDeleteStall }: StallListProps) {
  const [stalls, setStalls] = useState<StallWithAssignment[]>([]);
  const [filteredStalls, setFilteredStalls] = useState<StallWithAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'occupied' | 'vacant'>('all');

  useEffect(() => {
    loadStalls();
  }, []);

  useEffect(() => {
    let filtered = stalls;

    if (searchTerm) {
      filtered = filtered.filter(
        (stall) =>
          stall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stall.building?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((stall) =>
        filterStatus === 'occupied' ? stall.is_occupied : !stall.is_occupied
      );
    }

    setFilteredStalls(filtered);
  }, [searchTerm, filterStatus, stalls]);

  const loadStalls = async () => {
    try {
      const { data: stallsData, error: stallsError } = await supabase
        .from('stalls')
        .select('*')
        .order('name');

      if (stallsError) throw stallsError;

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('boarding_assignments')
        .select(`
          *,
          horse:horses(
            *,
            owner:owners(*)
          )
        `)
        .is('end_date', null);

      if (assignmentsError) throw assignmentsError;

      const stallsWithAssignments: StallWithAssignment[] = (stallsData || []).map((stall) => {
        const assignment = assignmentsData?.find((a) => a.stall_id === stall.id);
        return {
          ...stall,
          current_assignment: assignment || undefined,
          is_occupied: !!assignment,
        };
      });

      setStalls(stallsWithAssignments);
      setFilteredStalls(stallsWithAssignments);
    } catch (error) {
      console.error('Error loading stalls:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: stalls.length,
    occupied: stalls.filter((s) => s.is_occupied).length,
    vacant: stalls.filter((s) => !s.is_occupied).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stalls & Boarding</h2>
          <p className="text-gray-600 mt-1">Manage stables and boarding assignments</p>
        </div>
        <button
          onClick={onAddStall}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus className="h-5 w-5" />
          <span>Add Stall</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stalls</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <DoorOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.occupied}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vacant</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.vacant}</p>
            </div>
            <div className="bg-gray-100 rounded-full p-3">
              <DoorClosed className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by stall name or building..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('occupied')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'occupied'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Occupied
            </button>
            <button
              onClick={() => setFilterStatus('vacant')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'vacant'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Vacant
            </button>
          </div>
        </div>
      </div>

      {filteredStalls.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <DoorOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No stalls found' : 'No stalls yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first stall'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={onAddStall}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                <Plus className="h-5 w-5" />
                <span>Add Your First Stall</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStalls.map((stall) => (
            <div
              key={stall.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
            >
              <div
                className={`h-2 ${
                  stall.is_occupied ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {stall.name}
                    </h3>
                    {stall.building && (
                      <p className="text-sm text-gray-600">{stall.building}</p>
                    )}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      stall.is_occupied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {stall.is_occupied ? 'Occupied' : 'Vacant'}
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {stall.size && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="text-gray-900 font-medium">{stall.size}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paddock Access:</span>
                    <span className="text-gray-900 font-medium">
                      {stall.has_paddock_access ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {stall.is_occupied && stall.current_assignment?.horse && (
                    <>
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-gray-600 mb-1">Current Horse:</p>
                        <p className="text-gray-900 font-medium">
                          {stall.current_assignment.horse.name}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Boarding Type:</span>
                        <span className="text-gray-900 font-medium capitalize">
                          {stall.current_assignment.boarding_type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Rate:</span>
                        <span className="text-gray-900 font-medium">
                          ${stall.current_assignment.monthly_rate.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => onViewStall(stall)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEditStall(stall)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteStall(stall)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredStalls.length} of {stalls.length} stalls
      </div>
    </div>
  );
}
