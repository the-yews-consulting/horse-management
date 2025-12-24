import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Owner } from '../types/database';
import { Users, Search, Plus, Loader2 } from 'lucide-react';

export function OwnerList() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOwners();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = owners.filter(
        (owner) =>
          owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOwners(filtered);
    } else {
      setFilteredOwners(owners);
    }
  }, [searchTerm, owners]);

  const loadOwners = async () => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .order('name');

      if (error) throw error;
      setOwners(data || []);
      setFilteredOwners(data || []);
    } catch (error) {
      console.error('Error loading owners:', error);
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-bold text-gray-900">Owners</h2>
          <p className="text-gray-600 mt-1">Manage horse owners and contact information</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {filteredOwners.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No owners found' : 'No owners yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Owners will be created when you add horses'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOwners.map((owner) => (
            <div
              key={owner.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">{owner.name}</h3>

              <div className="space-y-2 text-sm">
                {owner.email && (
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="text-gray-900">{owner.email}</p>
                  </div>
                )}
                {owner.phone && (
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="text-gray-900">{owner.phone}</p>
                  </div>
                )}
                {owner.address && (
                  <div>
                    <p className="text-gray-600">Address</p>
                    <p className="text-gray-900">{owner.address}</p>
                  </div>
                )}
                {owner.notes && (
                  <div>
                    <p className="text-gray-600">Notes</p>
                    <p className="text-gray-900 line-clamp-2">{owner.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredOwners.length} of {owners.length} owners
      </div>
    </div>
  );
}
