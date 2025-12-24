import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Vet } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { Stethoscope, Search, Plus, Loader2, Phone, Building2, CreditCard } from 'lucide-react';

interface VetFormData {
  name: string;
  address: string;
  mobile_phone: string;
  office_phone: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_routing_number: string;
  notes: string;
}

export function VetList() {
  const { user } = useAuth();
  const [vets, setVets] = useState<Vet[]>([]);
  const [filteredVets, setFilteredVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVet, setEditingVet] = useState<Vet | null>(null);
  const [formData, setFormData] = useState<VetFormData>({
    name: '',
    address: '',
    mobile_phone: '',
    office_phone: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_routing_number: '',
    notes: '',
  });

  useEffect(() => {
    loadVets();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = vets.filter(
        (vet) =>
          vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vet.mobile_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vet.office_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vet.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVets(filtered);
    } else {
      setFilteredVets(vets);
    }
  }, [searchTerm, vets]);

  const loadVets = async () => {
    try {
      const { data, error } = await supabase
        .from('vets')
        .select('*')
        .order('name');

      if (error) throw error;
      setVets(data || []);
      setFilteredVets(data || []);
    } catch (error) {
      console.error('Error loading vets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingVet(null);
    setFormData({
      name: '',
      address: '',
      mobile_phone: '',
      office_phone: '',
      bank_account_name: '',
      bank_account_number: '',
      bank_routing_number: '',
      notes: '',
    });
    setShowForm(true);
  };

  const handleEdit = (vet: Vet) => {
    setEditingVet(vet);
    setFormData({
      name: vet.name,
      address: vet.address || '',
      mobile_phone: vet.mobile_phone || '',
      office_phone: vet.office_phone || '',
      bank_account_name: vet.bank_account_name || '',
      bank_account_number: vet.bank_account_number || '',
      bank_routing_number: vet.bank_routing_number || '',
      notes: vet.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingVet) {
        const { error } = await supabase
          .from('vets')
          .update({
            ...formData,
            address: formData.address || null,
            mobile_phone: formData.mobile_phone || null,
            office_phone: formData.office_phone || null,
            bank_account_name: formData.bank_account_name || null,
            bank_account_number: formData.bank_account_number || null,
            bank_routing_number: formData.bank_routing_number || null,
            notes: formData.notes || null,
          })
          .eq('id', editingVet.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vets')
          .insert([{
            ...formData,
            address: formData.address || null,
            mobile_phone: formData.mobile_phone || null,
            office_phone: formData.office_phone || null,
            bank_account_name: formData.bank_account_name || null,
            bank_account_number: formData.bank_account_number || null,
            bank_routing_number: formData.bank_routing_number || null,
            notes: formData.notes || null,
            user_id: user?.id,
          }]);

        if (error) throw error;
      }

      setShowForm(false);
      loadVets();
    } catch (error) {
      console.error('Error saving vet:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this veterinarian?')) return;

    try {
      const { error } = await supabase
        .from('vets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadVets();
    } catch (error) {
      console.error('Error deleting vet:', error);
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Veterinarians</h2>
          <p className="text-gray-600 mt-1">Manage veterinarian contacts and payment information</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5" />
          <span>Add Veterinarian</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {filteredVets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No veterinarians found' : 'No veterinarians yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Add your first veterinarian to get started'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVets.map((vet) => (
            <div
              key={vet.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(vet)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vet.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">{vet.name}</h3>

              <div className="space-y-2 text-sm">
                {vet.mobile_phone && (
                  <div className="flex items-start space-x-2">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Mobile</p>
                      <p className="text-gray-900">{vet.mobile_phone}</p>
                    </div>
                  </div>
                )}
                {vet.office_phone && (
                  <div className="flex items-start space-x-2">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Office</p>
                      <p className="text-gray-900">{vet.office_phone}</p>
                    </div>
                  </div>
                )}
                {vet.address && (
                  <div className="flex items-start space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Address</p>
                      <p className="text-gray-900">{vet.address}</p>
                    </div>
                  </div>
                )}
                {vet.bank_account_name && (
                  <div className="flex items-start space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Bank Account</p>
                      <p className="text-gray-900">{vet.bank_account_name}</p>
                      {vet.bank_account_number && (
                        <p className="text-gray-600 text-xs">****{vet.bank_account_number.slice(-4)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {editingVet ? 'Edit Veterinarian' : 'Add Veterinarian'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.mobile_phone}
                      onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Office Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.office_phone}
                      onChange={(e) => setFormData({ ...formData, office_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Bank Account Details</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={formData.bank_account_name}
                        onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={formData.bank_account_number}
                          onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Routing Number
                        </label>
                        <input
                          type="text"
                          value={formData.bank_routing_number}
                          onChange={(e) => setFormData({ ...formData, bank_routing_number: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingVet ? 'Update' : 'Add'} Veterinarian
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredVets.length} of {vets.length} veterinarians
      </div>
    </div>
  );
}
