import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getHorses, createHorse, updateHorse, deleteHorse, getOwners, Horse, Owner } from '../services/api';
import { Modal } from '../components/Modal';
import { QuickNav } from '../components/QuickNav';

interface ListItem {
  id: string;
  name: string;
  abbreviation: string;
  isDefault: boolean;
}

export function HorsesPage() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [breeds, setBreeds] = useState<ListItem[]>([]);
  const [colours, setColours] = useState<ListItem[]>([]);
  const [genders, setGenders] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<Partial<Horse>>({
    name: '',
    breed: '',
    color: '',
    age: undefined,
    gender: undefined,
    owner_id: undefined,
    colour: undefined,
    height: undefined,
    clipped: false,
    fei_id: '',
    passport_number: '',
    pet_name: '',
    rfid: '',
    rug_name: '',
    sire: '',
    dam: '',
    bloodline_info: '',
    breeding_status: '',
    breeding_notes: '',
    inquiry_notes: '',
    competition_record: '',
    training_notes: '',
    video_urls: '',
    related_links: '',
  });

  useEffect(() => {
    loadHorses();
    loadOwners();
    loadBreeds();
    loadColours();
    loadGenders();
  }, []);

  const loadHorses = async () => {
    try {
      const data = await getHorses();
      setHorses(data);
    } catch (error) {
      console.error('Failed to load horses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOwners = async () => {
    try {
      const data = await getOwners();
      setOwners(data);
    } catch (error) {
      console.error('Failed to load owners:', error);
    }
  };

  const loadBreeds = async () => {
    try {
      const response = await fetch('/api/horse-lists/breeds', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setBreeds(data);
        }
      }
    } catch (error) {
      console.error('Failed to load breeds:', error);
      setBreeds([]);
    }
  };

  const loadColours = async () => {
    try {
      const response = await fetch('/api/horse-lists/colours', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setColours(data);
        }
      }
    } catch (error) {
      console.error('Failed to load colours:', error);
      setColours([]);
    }
  };

  const loadGenders = async () => {
    try {
      const response = await fetch('/api/horse-lists/genders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setGenders(data);
        }
      }
    } catch (error) {
      console.error('Failed to load genders:', error);
      setGenders([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHorse) {
        await updateHorse(editingHorse.id!, formData as Horse);
      } else {
        await createHorse(formData as Horse);
      }
      setIsModalOpen(false);
      setEditingHorse(null);
      setFormData({
        name: '',
        breed: '',
        color: '',
        age: undefined,
        gender: undefined,
        owner_id: undefined,
        colour: undefined,
        height: undefined,
        clipped: false,
        fei_id: '',
        passport_number: '',
        pet_name: '',
        rfid: '',
        rug_name: '',
        sire: '',
        dam: '',
        bloodline_info: '',
        breeding_status: '',
        breeding_notes: '',
        inquiry_notes: '',
        competition_record: '',
        training_notes: '',
        video_urls: '',
        related_links: '',
      });
      loadHorses();
    } catch (error) {
      console.error('Failed to save horse:', error);
      alert('Failed to save horse. Please try again.');
    }
  };

  const handleEdit = (horse: Horse) => {
    setEditingHorse(horse);
    setActiveTab('basic');
    setFormData(horse);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this horse?')) return;
    try {
      await deleteHorse(id);
      loadHorses();
    } catch (error) {
      console.error('Failed to delete horse:', error);
      alert('Failed to delete horse. Please try again.');
    }
  };

  const handleAddNew = () => {
    setEditingHorse(null);
    setActiveTab('basic');
    setFormData({
      name: '',
      breed: '',
      color: '',
      age: undefined,
      gender: undefined,
      owner_id: undefined,
      colour: undefined,
      height: undefined,
      clipped: false,
      fei_id: '',
      passport_number: '',
      pet_name: '',
      rfid: '',
      rug_name: '',
      sire: '',
      dam: '',
      bloodline_info: '',
      breeding_status: '',
      breeding_notes: '',
      inquiry_notes: '',
      competition_record: '',
      training_notes: '',
      video_urls: '',
      related_links: '',
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <QuickNav />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Horses</h1>
          <p className="text-gray-600 mt-1">Manage your horses</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Horse
        </button>
      </div>

      {horses.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No horses added yet. Add your first horse to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Breed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Height
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {horses.map((horse) => (
                <tr key={horse.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{horse.name}</div>
                    {horse.pet_name && (
                      <div className="text-xs text-gray-500">"{horse.pet_name}"</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {horse.breed || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {horse.colour || horse.color || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {horse.height ? `${horse.height}hh` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {horse.gender || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {horse.owner_first_name && horse.owner_last_name
                      ? `${horse.owner_first_name} ${horse.owner_last_name}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(horse)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(horse.id!)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
        title={editingHorse ? 'Edit Horse' : 'Add New Horse'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 overflow-x-auto">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'diet', label: 'Diet' },
                { id: 'ownership', label: 'Ownership' },
                { id: 'pedigree', label: 'Pedigree' },
                { id: 'breeding', label: 'Breeding' },
                { id: 'inquiry', label: 'Inquiry' },
                { id: 'performance', label: 'Performance' },
                { id: 'media', label: 'Media' },
                { id: 'links', label: 'Links' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            {activeTab === 'basic' && (
              <div className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet Name
                </label>
                <input
                  type="text"
                  value={formData.pet_name || ''}
                  onChange={(e) => setFormData({ ...formData, pet_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed
                </label>
                <select
                  value={formData.breed || ''}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select breed</option>
                  {breeds.map((breed) => (
                    <option key={breed.id} value={breed.name}>
                      {breed.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  {genders.map((gender) => (
                    <option key={gender.id} value={gender.name.toLowerCase()}>
                      {gender.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colour
                </label>
                <select
                  value={formData.colour || ''}
                  onChange={(e) => setFormData({ ...formData, colour: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select colour</option>
                  {colours.map((colour) => (
                    <option key={colour.id} value={colour.name}>
                      {colour.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (hands)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height || ''}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 16.2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    checked={formData.clipped || false}
                    onChange={(e) => setFormData({ ...formData, clipped: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Clipped</span>
                </label>
              </div>
            </div>

                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mt-6">Identification</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      FEI ID
                    </label>
                    <input
                      type="text"
                      value={formData.fei_id || ''}
                      onChange={(e) => setFormData({ ...formData, fei_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passport No.
                    </label>
                    <input
                      type="text"
                      value={formData.passport_number || ''}
                      onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RFID
                    </label>
                    <input
                      type="text"
                      value={formData.rfid || ''}
                      onChange={(e) => setFormData({ ...formData, rfid: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rug Name
                    </label>
                    <input
                      type="text"
                      value={formData.rug_name || ''}
                      onChange={(e) => setFormData({ ...formData, rug_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'diet' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Requirements
                  </label>
                  <textarea
                    value={formData.dietary_requirements || ''}
                    onChange={(e) => setFormData({ ...formData, dietary_requirements: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Special dietary needs, allergies, supplements..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'ownership' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner
                  </label>
                  <select
                    value={formData.owner_id || ''}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select owner</option>
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.first_name} {owner.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'pedigree' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sire
                    </label>
                    <input
                      type="text"
                      value={formData.sire || ''}
                      onChange={(e) => setFormData({ ...formData, sire: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Father's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dam
                    </label>
                    <input
                      type="text"
                      value={formData.dam || ''}
                      onChange={(e) => setFormData({ ...formData, dam: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mother's name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bloodline Information
                  </label>
                  <textarea
                    value={formData.bloodline_info || ''}
                    onChange={(e) => setFormData({ ...formData, bloodline_info: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional pedigree details..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'breeding' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breeding Status
                  </label>
                  <select
                    value={formData.breeding_status || ''}
                    onChange={(e) => setFormData({ ...formData, breeding_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select status</option>
                    <option value="available">Available for Breeding</option>
                    <option value="not_available">Not Available</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breeding Notes
                  </label>
                  <textarea
                    value={formData.breeding_notes || ''}
                    onChange={(e) => setFormData({ ...formData, breeding_notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Breeding history, offspring details..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'inquiry' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inquiry Notes
                  </label>
                  <textarea
                    value={formData.inquiry_notes || ''}
                    onChange={(e) => setFormData({ ...formData, inquiry_notes: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Inquiries, expressions of interest, sale discussions..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Competition Record
                  </label>
                  <textarea
                    value={formData.competition_record || ''}
                    onChange={(e) => setFormData({ ...formData, competition_record: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Competition results, placings, achievements..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Training Notes
                  </label>
                  <textarea
                    value={formData.training_notes || ''}
                    onChange={(e) => setFormData({ ...formData, training_notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Training progress, discipline, skill level..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    value={formData.photo_url || ''}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URLs
                  </label>
                  <textarea
                    value={formData.video_urls || ''}
                    onChange={(e) => setFormData({ ...formData, video_urls: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="One URL per line..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'links' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Links
                  </label>
                  <textarea
                    value={formData.related_links || ''}
                    onChange={(e) => setFormData({ ...formData, related_links: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="One link per line - registration documents, health records, etc..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t bg-white">
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
              {editingHorse ? 'Update' : 'Add'} Horse
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
