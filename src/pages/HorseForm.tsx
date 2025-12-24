import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { HorseWithOwner, Owner, Vet, Farrier } from '../types/database';
import { X, Loader2, Plus } from 'lucide-react';

interface HorseFormProps {
  horse?: HorseWithOwner;
  onClose: () => void;
  onSave: () => void;
}

export function HorseForm({ horse, onClose, onSave }: HorseFormProps) {
  const [formData, setFormData] = useState({
    name: horse?.name || '',
    breed: horse?.breed || '',
    color: horse?.color || '',
    date_of_birth: horse?.date_of_birth || '',
    microchip_id: horse?.microchip_id || '',
    registration_number: horse?.registration_number || '',
    medical_notes: horse?.medical_notes || '',
    dietary_requirements: horse?.dietary_requirements || '',
    owner_id: horse?.owner_id || '',
    vet_id: horse?.vet_id || '',
    farrier_id: horse?.farrier_id || '',
  });

  const [owners, setOwners] = useState<Owner[]>([]);
  const [vets, setVets] = useState<Vet[]>([]);
  const [farriers, setFarriers] = useState<Farrier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewOwnerForm, setShowNewOwnerForm] = useState(false);

  useEffect(() => {
    loadOwners();
    loadVets();
    loadFarriers();
  }, []);

  const loadOwners = async () => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .order('name');

      if (error) throw error;
      setOwners(data || []);
    } catch (error) {
      console.error('Error loading owners:', error);
    }
  };

  const loadVets = async () => {
    try {
      const { data, error } = await supabase
        .from('vets')
        .select('*')
        .order('name');

      if (error) throw error;
      setVets(data || []);
    } catch (error) {
      console.error('Error loading vets:', error);
    }
  };

  const loadFarriers = async () => {
    try {
      const { data, error } = await supabase
        .from('farriers')
        .select('*')
        .order('name');

      if (error) throw error;
      setFarriers(data || []);
    } catch (error) {
      console.error('Error loading farriers:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.name.trim()) {
      setError('Horse name is required');
      setLoading(false);
      return;
    }

    if (!formData.owner_id) {
      setError('Please select an owner');
      setLoading(false);
      return;
    }

    try {
      if (horse) {
        const { error: updateError } = await supabase
          .from('horses')
          .update({
            name: formData.name.trim(),
            breed: formData.breed.trim() || null,
            color: formData.color.trim() || null,
            date_of_birth: formData.date_of_birth || null,
            microchip_id: formData.microchip_id.trim() || null,
            registration_number: formData.registration_number.trim() || null,
            medical_notes: formData.medical_notes.trim() || null,
            dietary_requirements: formData.dietary_requirements.trim() || null,
            owner_id: formData.owner_id,
            vet_id: formData.vet_id || null,
            farrier_id: formData.farrier_id || null,
          })
          .eq('id', horse.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('horses')
          .insert([{
            name: formData.name.trim(),
            breed: formData.breed.trim() || null,
            color: formData.color.trim() || null,
            date_of_birth: formData.date_of_birth || null,
            microchip_id: formData.microchip_id.trim() || null,
            registration_number: formData.registration_number.trim() || null,
            medical_notes: formData.medical_notes.trim() || null,
            dietary_requirements: formData.dietary_requirements.trim() || null,
            owner_id: formData.owner_id,
            vet_id: formData.vet_id || null,
            farrier_id: formData.farrier_id || null,
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

  const calculateAge = (dateOfBirth: string): string => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} years old` : '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {horse ? 'Edit Horse' : 'Add New Horse'}
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
                Horse Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter horse name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Breed
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., Thoroughbred, Arabian"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., Bay, Chestnut, Black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {formData.date_of_birth && (
                <p className="mt-1 text-xs text-gray-500">
                  Age: {calculateAge(formData.date_of_birth)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Microchip ID
              </label>
              <input
                type="text"
                value={formData.microchip_id}
                onChange={(e) => setFormData({ ...formData, microchip_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
                placeholder="e.g., 123456789012345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number
              </label>
              <input
                type="text"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Official registration number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <select
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select an owner</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewOwnerForm(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>New</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Veterinarian
              </label>
              <select
                value={formData.vet_id}
                onChange={(e) => setFormData({ ...formData, vet_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select a veterinarian</option>
                {vets.map((vet) => (
                  <option key={vet.id} value={vet.id}>
                    {vet.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farrier
              </label>
              <select
                value={formData.farrier_id}
                onChange={(e) => setFormData({ ...formData, farrier_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select a farrier</option>
                {farriers.map((farrier) => (
                  <option key={farrier.id} value={farrier.id}>
                    {farrier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Notes
            </label>
            <textarea
              value={formData.medical_notes}
              onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Medical history, vaccinations, conditions, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Requirements
            </label>
            <textarea
              value={formData.dietary_requirements}
              onChange={(e) => setFormData({ ...formData, dietary_requirements: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Feeding schedule, special diet, supplements, etc."
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
              <span>{horse ? 'Save Changes' : 'Add Horse'}</span>
            </button>
          </div>
        </form>
      </div>

      {showNewOwnerForm && (
        <NewOwnerModal
          onClose={() => setShowNewOwnerForm(false)}
          onSave={(ownerId) => {
            setFormData({ ...formData, owner_id: ownerId });
            setShowNewOwnerForm(false);
            loadOwners();
          }}
        />
      )}
    </div>
  );
}

interface NewOwnerModalProps {
  onClose: () => void;
  onSave: (ownerId: string) => void;
}

function NewOwnerModal({ onClose, onSave }: NewOwnerModalProps) {
  const [ownerData, setOwnerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!ownerData.name.trim()) {
      setError('Owner name is required');
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('owners')
        .insert([{
          name: ownerData.name.trim(),
          email: ownerData.email.trim() || null,
          phone: ownerData.phone.trim() || null,
          address: ownerData.address.trim() || null,
          user_id: user.id,
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      onSave(data.id);
    } catch (error: any) {
      setError(error.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Add New Owner</h3>
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
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={ownerData.name}
              onChange={(e) => setOwnerData({ ...ownerData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={ownerData.email}
              onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={ownerData.phone}
              onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={ownerData.address}
              onChange={(e) => setOwnerData({ ...ownerData, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium flex items-center space-x-2"
            >
              {loading && <Loader2 className="animate-spin h-4 w-4" />}
              <span>Add Owner</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
