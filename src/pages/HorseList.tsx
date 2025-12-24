import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { HorseWithOwner } from '../types/database';
import { Search, Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';

interface HorseListProps {
  onAddHorse: () => void;
  onEditHorse: (horse: HorseWithOwner) => void;
  onViewHorse: (horse: HorseWithOwner) => void;
  onDeleteHorse: (horse: HorseWithOwner) => void;
}

export function HorseList({ onAddHorse, onEditHorse, onViewHorse, onDeleteHorse }: HorseListProps) {
  const [horses, setHorses] = useState<HorseWithOwner[]>([]);
  const [filteredHorses, setFilteredHorses] = useState<HorseWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHorses();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = horses.filter(
        (horse) =>
          horse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          horse.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          horse.microchip_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHorses(filtered);
    } else {
      setFilteredHorses(horses);
    }
  }, [searchTerm, horses]);

  const loadHorses = async () => {
    try {
      const { data, error } = await supabase
        .from('horses')
        .select(`
          *,
          owner:owners(*),
          vet:vets(*),
          farrier:farriers(*)
        `)
        .order('name');

      if (error) throw error;
      setHorses(data || []);
      setFilteredHorses(data || []);
    } catch (error) {
      console.error('Error loading horses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string | null): string => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} years` : 'N/A';
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
          <h2 className="text-2xl font-bold text-gray-900">My Horses</h2>
          <p className="text-gray-600 mt-1">Manage your equine companions</p>
        </div>
        <button
          onClick={onAddHorse}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus className="h-5 w-5" />
          <span>Add Horse</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, breed, or microchip ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {filteredHorses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No horses found' : 'No horses yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first horse'}
            </p>
            {!searchTerm && (
              <button
                onClick={onAddHorse}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                <Plus className="h-5 w-5" />
                <span>Add Your First Horse</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Breed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Microchip ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHorses.map((horse) => (
                  <tr key={horse.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{horse.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {horse.breed || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {horse.color || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {calculateAge(horse.date_of_birth)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-mono text-sm">
                      {horse.microchip_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {horse.owner?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onViewHorse(horse)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEditHorse(horse)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteHorse(horse)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredHorses.length} of {horses.length} horses
      </div>
    </div>
  );
}
