import { useState, useEffect, FormEvent } from 'react';
import { StallWithAssignment, HorseWithOwner } from '../types/database';
import { supabase } from '../lib/supabase';
import { X, Edit, Trash2, DoorOpen, CheckCircle2, Plus, Loader2, Calendar } from 'lucide-react';

interface StallDetailProps {
  stall: StallWithAssignment;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}

export function StallDetail({ stall, onClose, onEdit, onDelete, onUpdate }: StallDetailProps) {
  const [showAssignHorse, setShowAssignHorse] = useState(false);
  const [availableHorses, setAvailableHorses] = useState<HorseWithOwner[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableHorses();
  }, []);

  const loadAvailableHorses = async () => {
    try {
      const { data: assignedHorseIds } = await supabase
        .from('boarding_assignments')
        .select('horse_id')
        .is('end_date', null);

      const assignedIds = assignedHorseIds?.map((a) => a.horse_id) || [];

      let query = supabase
        .from('horses')
        .select(`
          *,
          owner:owners(*)
        `);

      if (assignedIds.length > 0) {
        query = query.not('id', 'in', `(${assignedIds.join(',')})`);
      }

      const { data: horses, error } = await query.order('name');

      if (error) throw error;
      setAvailableHorses(horses || []);
    } catch (error) {
      console.error('Error loading horses:', error);
    }
  };

  const handleEndBoarding = async () => {
    if (!stall.current_assignment) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('boarding_assignments')
        .update({ end_date: new Date().toISOString().split('T')[0] })
        .eq('id', stall.current_assignment.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error ending boarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{stall.name}</h2>
              <p className="text-gray-600 mt-1">
                {stall.building || 'No building specified'}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                    stall.is_occupied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {stall.is_occupied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Occupied</span>
                    </>
                  ) : (
                    <>
                      <DoorOpen className="h-4 w-4" />
                      <span>Vacant</span>
                    </>
                  )}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Stall Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Size</p>
                <p className="text-gray-900 font-medium mt-1">
                  {stall.size || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Paddock Access</p>
                <p className="text-gray-900 font-medium mt-1">
                  {stall.has_paddock_access ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            {stall.notes && (
              <div className="mt-3">
                <p className="text-gray-600 text-sm">Notes</p>
                <p className="text-gray-900 mt-1">{stall.notes}</p>
              </div>
            )}
          </div>

          {stall.is_occupied && stall.current_assignment ? (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Boarding</h3>
                <button
                  onClick={handleEndBoarding}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition flex items-center space-x-2"
                >
                  {loading && <Loader2 className="animate-spin h-4 w-4" />}
                  <span>End Boarding</span>
                </button>
              </div>

              <div className="bg-green-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Horse</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stall.current_assignment.horse?.name}
                  </p>
                  {stall.current_assignment.horse?.owner && (
                    <p className="text-sm text-gray-700 mt-1">
                      Owner: {stall.current_assignment.horse.owner.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Boarding Type</p>
                    <p className="text-gray-900 font-medium mt-1 capitalize">
                      {stall.current_assignment.boarding_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Rate</p>
                    <p className="text-gray-900 font-medium mt-1">
                      ${stall.current_assignment.monthly_rate.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Start Date</p>
                    <p className="text-gray-900 font-medium mt-1">
                      {formatDate(stall.current_assignment.start_date)}
                    </p>
                  </div>
                </div>

                {stall.current_assignment.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Boarding Notes</p>
                    <p className="text-gray-900 mt-1">
                      {stall.current_assignment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <DoorOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Stall is Vacant
                </h3>
                <p className="text-gray-600 mb-4">
                  This stall is currently available for boarding
                </p>
                <button
                  onClick={() => setShowAssignHorse(true)}
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  <Plus className="h-5 w-5" />
                  <span>Assign Horse</span>
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                <p>Created: {formatDate(stall.created_at)}</p>
                <p className="mt-1">Last Updated: {formatDate(stall.updated_at)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onDelete}
              className="flex items-center space-x-2 px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium transition"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Stall</span>
            </button>
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Stall</span>
            </button>
          </div>
        </div>
      </div>

      {showAssignHorse && (
        <AssignHorseModal
          stallId={stall.id}
          stallName={stall.name}
          availableHorses={availableHorses}
          onClose={() => setShowAssignHorse(false)}
          onAssign={() => {
            setShowAssignHorse(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}

interface AssignHorseModalProps {
  stallId: string;
  stallName: string;
  availableHorses: HorseWithOwner[];
  onClose: () => void;
  onAssign: () => void;
}

function AssignHorseModal({ stallId, stallName, availableHorses, onClose, onAssign }: AssignHorseModalProps) {
  const [formData, setFormData] = useState({
    horse_id: '',
    boarding_type: 'full' as 'full' | 'partial' | 'training',
    monthly_rate: '',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.horse_id) {
      setError('Please select a horse');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('boarding_assignments')
        .insert([{
          horse_id: formData.horse_id,
          stall_id: stallId,
          boarding_type: formData.boarding_type,
          monthly_rate: parseFloat(formData.monthly_rate) || 0,
          start_date: formData.start_date,
          notes: formData.notes.trim() || null,
        }]);

      if (insertError) throw insertError;
      onAssign();
    } catch (error: any) {
      setError(error.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            Assign Horse to {stallName}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Horse <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.horse_id}
              onChange={(e) => setFormData({ ...formData, horse_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Choose a horse...</option>
              {availableHorses.map((horse) => (
                <option key={horse.id} value={horse.id}>
                  {horse.name} {horse.owner ? `(${horse.owner.name})` : ''}
                </option>
              ))}
            </select>
            {availableHorses.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                No available horses. All horses are currently assigned to stalls.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Boarding Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.boarding_type}
              onChange={(e) =>
                setFormData({ ...formData, boarding_type: e.target.value as any })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="full">Full Board</option>
              <option value="partial">Partial Board</option>
              <option value="training">Training</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Rate ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.monthly_rate}
              onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Additional boarding information..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || availableHorses.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium flex items-center space-x-2"
            >
              {loading && <Loader2 className="animate-spin h-4 w-4" />}
              <span>Assign Horse</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
