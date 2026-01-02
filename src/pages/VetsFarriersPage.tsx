import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Stethoscope, Hammer } from 'lucide-react';
import {
  getVets,
  createVet,
  updateVet,
  deleteVet,
  getFarriers,
  createFarrier,
  updateFarrier,
  deleteFarrier,
  Vet,
  Farrier
} from '../services/api';
import { Modal } from '../components/Modal';

export function VetsFarriersPage() {
  const [vets, setVets] = useState<Vet[]>([]);
  const [farriers, setFarriers] = useState<Farrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVetModalOpen, setIsVetModalOpen] = useState(false);
  const [isFarrierModalOpen, setIsFarrierModalOpen] = useState(false);
  const [editingVet, setEditingVet] = useState<Vet | null>(null);
  const [editingFarrier, setEditingFarrier] = useState<Farrier | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vetsData, farriersData] = await Promise.all([getVets(), getFarriers()]);
      setVets(vetsData);
      setFarriers(farriersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVet = () => {
    setEditingVet(null);
    setIsVetModalOpen(true);
  };

  const handleEditVet = (vet: Vet) => {
    setEditingVet(vet);
    setIsVetModalOpen(true);
  };

  const handleDeleteVet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vet?')) return;
    try {
      await deleteVet(id);
      loadData();
    } catch (error) {
      alert('Failed to delete vet');
    }
  };

  const handleVetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vetData: Vet = {
      name: formData.get('name') as string,
      clinic_name: formData.get('clinic_name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      emergency_phone: formData.get('emergency_phone') as string,
      specialties: formData.get('specialties') as string,
      notes: formData.get('notes') as string,
    };

    try {
      if (editingVet?.id) {
        await updateVet(editingVet.id, vetData);
      } else {
        await createVet(vetData);
      }
      setIsVetModalOpen(false);
      loadData();
    } catch (error) {
      alert('Failed to save vet');
    }
  };

  const handleAddFarrier = () => {
    setEditingFarrier(null);
    setIsFarrierModalOpen(true);
  };

  const handleEditFarrier = (farrier: Farrier) => {
    setEditingFarrier(farrier);
    setIsFarrierModalOpen(true);
  };

  const handleDeleteFarrier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this farrier?')) return;
    try {
      await deleteFarrier(id);
      loadData();
    } catch (error) {
      alert('Failed to delete farrier');
    }
  };

  const handleFarrierSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const farrierData: Farrier = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      service_areas: formData.get('service_areas') as string,
      notes: formData.get('notes') as string,
    };

    try {
      if (editingFarrier?.id) {
        await updateFarrier(editingFarrier.id, farrierData);
      } else {
        await createFarrier(farrierData);
      }
      setIsFarrierModalOpen(false);
      loadData();
    } catch (error) {
      alert('Failed to save farrier');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vets & Farriers</h1>
        <p className="text-gray-600 mt-1">Manage veterinarians and farriers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Veterinarians</h2>
            </div>
            <button
              onClick={handleAddVet}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Vet</span>
            </button>
          </div>

          <div className="p-6">
            {vets.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No vets added yet.</p>
            ) : (
              <div className="space-y-4">
                {vets.map((vet) => (
                  <div
                    key={vet.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{vet.name}</h3>
                        {vet.clinic_name && (
                          <p className="text-sm text-gray-600">{vet.clinic_name}</p>
                        )}
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {vet.phone}
                          </div>
                          {vet.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              {vet.email}
                            </div>
                          )}
                          {vet.address && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {vet.address}
                            </div>
                          )}
                          {vet.specialties && (
                            <p className="text-sm text-gray-500 mt-2">
                              <span className="font-medium">Specialties:</span> {vet.specialties}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditVet(vet)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVet(vet.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Hammer className="h-6 w-6 text-amber-600" />
              <h2 className="text-xl font-semibold text-gray-900">Farriers</h2>
            </div>
            <button
              onClick={handleAddFarrier}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Farrier</span>
            </button>
          </div>

          <div className="p-6">
            {farriers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No farriers added yet.</p>
            ) : (
              <div className="space-y-4">
                {farriers.map((farrier) => (
                  <div
                    key={farrier.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-amber-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{farrier.name}</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {farrier.phone}
                          </div>
                          {farrier.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              {farrier.email}
                            </div>
                          )}
                          {farrier.address && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {farrier.address}
                            </div>
                          )}
                          {farrier.service_areas && (
                            <p className="text-sm text-gray-500 mt-2">
                              <span className="font-medium">Service Areas:</span> {farrier.service_areas}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditFarrier(farrier)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFarrier(farrier.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isVetModalOpen}
        onClose={() => setIsVetModalOpen(false)}
        title={editingVet ? 'Edit Vet' : 'Add Vet'}
      >
        <form onSubmit={handleVetSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              defaultValue={editingVet?.name}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clinic Name
            </label>
            <input
              type="text"
              name="clinic_name"
              defaultValue={editingVet?.clinic_name}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                defaultValue={editingVet?.phone}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Phone
              </label>
              <input
                type="tel"
                name="emergency_phone"
                defaultValue={editingVet?.emergency_phone}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              defaultValue={editingVet?.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              defaultValue={editingVet?.address}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialties
            </label>
            <input
              type="text"
              name="specialties"
              defaultValue={editingVet?.specialties}
              placeholder="e.g., Equine Surgery, Dentistry"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              defaultValue={editingVet?.notes}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsVetModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {editingVet ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isFarrierModalOpen}
        onClose={() => setIsFarrierModalOpen(false)}
        title={editingFarrier ? 'Edit Farrier' : 'Add Farrier'}
      >
        <form onSubmit={handleFarrierSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              defaultValue={editingFarrier?.name}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={editingFarrier?.phone}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              defaultValue={editingFarrier?.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              defaultValue={editingFarrier?.address}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Areas
            </label>
            <input
              type="text"
              name="service_areas"
              defaultValue={editingFarrier?.service_areas}
              placeholder="e.g., North County, South Valley"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              defaultValue={editingFarrier?.notes}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsFarrierModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              {editingFarrier ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
