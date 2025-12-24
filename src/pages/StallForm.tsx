import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { StallWithAssignment } from '../types/database';
import { X, Loader2 } from 'lucide-react';

interface StallFormProps {
  stall?: StallWithAssignment;
  onClose: () => void;
  onSave: () => void;
}

export function StallForm({ stall, onClose, onSave }: StallFormProps) {
  const [formData, setFormData] = useState({
    name: stall?.name || '',
    building: stall?.building || '',
    size: stall?.size || '',
    has_paddock_access: stall?.has_paddock_access || false,
    notes: stall?.notes || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.name.trim()) {
      setError('Stall name is required');
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (stall) {
        const { error: updateError } = await supabase
          .from('stalls')
          .update({
            name: formData.name.trim(),
            building: formData.building.trim() || null,
            size: formData.size.trim() || null,
            has_paddock_access: formData.has_paddock_access,
            notes: formData.notes.trim() || null,
          })
          .eq('id', stall.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('stalls')
          .insert([{
            name: formData.name.trim(),
            building: formData.building.trim() || null,
            size: formData.size.trim() || null,
            has_paddock_access: formData.has_paddock_access,
            notes: formData.notes.trim() || null,
            user_id: user.id,
          }]);

        if (insertError) throw insertError;
      }

      onSave();
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {stall ? 'Edit Stall' : 'Add New Stall'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stall Name/Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., Stall 1, A-12"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building/Location
              </label>
              <input
                type="text"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., Main Barn, North Wing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., 12x12, Large, Small"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_paddock_access}
                  onChange={(e) =>
                    setFormData({ ...formData, has_paddock_access: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Has Paddock Access
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Additional information about this stall..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition flex items-center space-x-2"
            >
              {loading && <Loader2 className="animate-spin h-4 w-4" />}
              <span>{stall ? 'Save Changes' : 'Add Stall'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
