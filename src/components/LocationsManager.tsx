import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Image as ImageIcon } from 'lucide-react';
import { Modal } from './Modal';

interface Farm {
  id: string;
  name: string;
  type?: string;
  manager_trainer_name?: string;
  address?: string;
  country?: string;
  office_no?: string;
  mobile_no?: string;
  fax_no?: string;
  email?: string;
  registration_number?: string;
  billing_centre?: string;
  active: boolean;
  note?: string;
  media_urls?: string[];
  map_location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface Yard {
  id: string;
  name: string;
  farm_id?: string;
  active: boolean;
  note?: string;
  media_urls?: string[];
  map_location?: {
    lat: number;
    lng: number;
    address: string;
  };
  farms?: {
    name: string;
  };
}

const COUNTRIES = [
  'England',
  'Scotland',
  'Wales',
  'Northern Ireland',
  'Ireland'
];

const FARM_TYPES = [
  'General',
  'Stud',
  'Training'
];

export function LocationsManager() {
  const [activeTab, setActiveTab] = useState<'farms' | 'yards'>('farms');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [yards, setYards] = useState<Yard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Farm | Yard | null>(null);

  const [farmFormData, setFarmFormData] = useState<Partial<Farm>>({
    name: '',
    type: 'General',
    manager_trainer_name: '',
    address: '',
    country: 'England',
    office_no: '',
    mobile_no: '',
    fax_no: '',
    email: '',
    registration_number: '',
    billing_centre: '',
    active: true,
    note: '',
    media_urls: [],
    map_location: undefined
  });

  const [yardFormData, setYardFormData] = useState<Partial<Yard>>({
    name: '',
    farm_id: '',
    active: true,
    note: '',
    media_urls: [],
    map_location: undefined
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [farmsResponse, yardsResponse] = await Promise.all([
        fetch('/api/farms', { headers }),
        fetch('/api/yards', { headers })
      ]);

      if (farmsResponse.ok) {
        const farmsData = await farmsResponse.json();
        setFarms(farmsData);
      }

      if (yardsResponse.ok) {
        const yardsData = await yardsResponse.json();
        setYards(yardsData);
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `/api/farms/${editingItem.id}`
        : '/api/farms';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(farmFormData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingItem(null);
        resetFarmForm();
        loadData();
      } else {
        alert('Failed to save farm');
      }
    } catch (error) {
      console.error('Failed to save farm:', error);
      alert('Failed to save farm');
    }
  };

  const handleSubmitYard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `/api/yards/${editingItem.id}`
        : '/api/yards';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(yardFormData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingItem(null);
        resetYardForm();
        loadData();
      } else {
        alert('Failed to save yard');
      }
    } catch (error) {
      console.error('Failed to save yard:', error);
      alert('Failed to save yard');
    }
  };

  const handleEditFarm = (farm: Farm) => {
    setEditingItem(farm);
    setFarmFormData(farm);
    setIsModalOpen(true);
  };

  const handleEditYard = (yard: Yard) => {
    setEditingItem(yard);
    setYardFormData(yard);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, type: 'farms' | 'yards') => {
    if (!confirm(`Are you sure you want to delete this ${type === 'farms' ? 'farm' : 'yard'}?`)) return;

    try {
      const response = await fetch(`/api/${type}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        loadData();
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete');
    }
  };

  const resetFarmForm = () => {
    setFarmFormData({
      name: '',
      type: 'General',
      manager_trainer_name: '',
      address: '',
      country: 'England',
      office_no: '',
      mobile_no: '',
      fax_no: '',
      email: '',
      registration_number: '',
      billing_centre: '',
      active: true,
      note: '',
      media_urls: [],
      map_location: undefined
    });
  };

  const resetYardForm = () => {
    setYardFormData({
      name: '',
      farm_id: '',
      active: true,
      note: '',
      media_urls: [],
      map_location: undefined
    });
  };

  const handleAddNew = () => {
    setEditingItem(null);
    if (activeTab === 'farms') {
      resetFarmForm();
    } else {
      resetYardForm();
    }
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const renderFarmForm = () => (
    <form onSubmit={handleSubmitFarm} className="space-y-4 max-h-[600px] overflow-y-auto px-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            value={farmFormData.name}
            onChange={(e) => setFarmFormData({ ...farmFormData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            value={farmFormData.type}
            onChange={(e) => setFarmFormData({ ...farmFormData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {FARM_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Manager/Trainer Name
          </label>
          <input
            type="text"
            value={farmFormData.manager_trainer_name}
            onChange={(e) => setFarmFormData({ ...farmFormData, manager_trainer_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            value={farmFormData.address}
            onChange={(e) => setFarmFormData({ ...farmFormData, address: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            value={farmFormData.country}
            onChange={(e) => setFarmFormData({ ...farmFormData, country: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Office No
          </label>
          <input
            type="text"
            value={farmFormData.office_no}
            onChange={(e) => setFarmFormData({ ...farmFormData, office_no: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile No
          </label>
          <input
            type="text"
            value={farmFormData.mobile_no}
            onChange={(e) => setFarmFormData({ ...farmFormData, mobile_no: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fax No
          </label>
          <input
            type="text"
            value={farmFormData.fax_no}
            onChange={(e) => setFarmFormData({ ...farmFormData, fax_no: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={farmFormData.email}
            onChange={(e) => setFarmFormData({ ...farmFormData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration Number
          </label>
          <input
            type="text"
            value={farmFormData.registration_number}
            onChange={(e) => setFarmFormData({ ...farmFormData, registration_number: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Billing Centre
          </label>
          <input
            type="text"
            value={farmFormData.billing_centre}
            onChange={(e) => setFarmFormData({ ...farmFormData, billing_centre: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={farmFormData.active}
              onChange={(e) => setFarmFormData({ ...farmFormData, active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <textarea
            value={farmFormData.note}
            onChange={(e) => setFarmFormData({ ...farmFormData, note: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ImageIcon className="inline mr-2" size={16} />
            Media Images
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
            <p className="text-sm">Media upload feature coming soon</p>
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline mr-2" size={16} />
            Map Location
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
            <p className="text-sm">Google Maps integration coming soon</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t border-gray-200 -mx-1 px-1 pb-1">
        <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {editingItem ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );

  const renderYardForm = () => (
    <form onSubmit={handleSubmitYard} className="space-y-4 max-h-[600px] overflow-y-auto px-1">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            value={yardFormData.name}
            onChange={(e) => setYardFormData({ ...yardFormData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Farm
          </label>
          <select
            value={yardFormData.farm_id}
            onChange={(e) => setYardFormData({ ...yardFormData, farm_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a farm...</option>
            {farms.map(farm => (
              <option key={farm.id} value={farm.id}>{farm.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={yardFormData.active}
              onChange={(e) => setYardFormData({ ...yardFormData, active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <textarea
            value={yardFormData.note}
            onChange={(e) => setYardFormData({ ...yardFormData, note: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ImageIcon className="inline mr-2" size={16} />
            Media Images
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
            <p className="text-sm">Media upload feature coming soon</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline mr-2" size={16} />
            Map Location
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
            <p className="text-sm">Google Maps integration coming soon</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t border-gray-200 -mx-1 px-1 pb-1">
        <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {editingItem ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('farms')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'farms'
                ? 'border-teal-700 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Farm / Location
          </button>
          <button
            onClick={() => setActiveTab('yards')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'yards'
                ? 'border-teal-700 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Yard / Paddock
          </button>
        </nav>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {activeTab === 'farms' ? 'Farms & Locations' : 'Yards & Paddocks'}
        </h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors"
        >
          <Plus size={20} />
          Add New
        </button>
      </div>

      {activeTab === 'farms' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager/Trainer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edit
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remove
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {farms.map((farm, index) => (
                <tr
                  key={farm.id}
                  className={`${index % 2 === 0 ? 'bg-cyan-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {farm.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {farm.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {farm.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {farm.manager_trainer_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {farm.active ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleEditFarm(farm)}
                      className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center justify-center"
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleDelete(farm.id, 'farms')}
                      className="text-red-600 hover:text-red-800 transition-colors inline-flex items-center justify-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edit
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remove
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {yards.map((yard, index) => (
                <tr
                  key={yard.id}
                  className={`${index % 2 === 0 ? 'bg-cyan-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {yard.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {yard.farms?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {yard.active ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleEditYard(yard)}
                      className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center justify-center"
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleDelete(yard.id, 'yards')}
                      className="text-red-600 hover:text-red-800 transition-colors inline-flex items-center justify-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? (activeTab === 'farms' ? 'Edit Farm' : 'Edit Yard') : (activeTab === 'farms' ? 'Add New Farm' : 'Add New Yard')}
      >
        {activeTab === 'farms' ? renderFarmForm() : renderYardForm()}
      </Modal>
    </div>
  );
}
