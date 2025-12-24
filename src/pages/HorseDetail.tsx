import { HorseWithOwner } from '../types/database';
import { X, Edit, Trash2, Calendar, Fingerprint, FileText, User, Stethoscope, Hammer } from 'lucide-react';

interface HorseDetailProps {
  horse: HorseWithOwner;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function HorseDetail({ horse, onClose, onEdit, onDelete }: HorseDetailProps) {
  const calculateAge = (dateOfBirth: string | null): string => {
    if (!dateOfBirth) return 'Not specified';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} years old` : 'Not specified';
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
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{horse.name}</h2>
              <p className="text-gray-600 mt-1">
                {horse.breed || 'Breed not specified'} • {horse.color || 'Color not specified'}
              </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Age Information</h3>
              </div>
              <p className="text-gray-700">
                <span className="font-medium">Date of Birth:</span>{' '}
                {formatDate(horse.date_of_birth)}
              </p>
              <p className="text-gray-700 mt-1">
                <span className="font-medium">Current Age:</span>{' '}
                {calculateAge(horse.date_of_birth)}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Owner Information</h3>
              </div>
              {horse.owner ? (
                <>
                  <p className="text-gray-700">
                    <span className="font-medium">Name:</span> {horse.owner.name}
                  </p>
                  {horse.owner.email && (
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Email:</span> {horse.owner.email}
                    </p>
                  )}
                  {horse.owner.phone && (
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Phone:</span> {horse.owner.phone}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No owner assigned</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Stethoscope className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Veterinarian</h3>
              </div>
              {horse.vet ? (
                <>
                  <p className="text-gray-700">
                    <span className="font-medium">Name:</span> {horse.vet.name}
                  </p>
                  {horse.vet.mobile_phone && (
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Mobile:</span> {horse.vet.mobile_phone}
                    </p>
                  )}
                  {horse.vet.office_phone && (
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Office:</span> {horse.vet.office_phone}
                    </p>
                  )}
                  {horse.vet.address && (
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Address:</span> {horse.vet.address}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No veterinarian assigned</p>
              )}
            </div>

            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Hammer className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-gray-900">Farrier</h3>
              </div>
              {horse.farrier ? (
                <>
                  <p className="text-gray-700">
                    <span className="font-medium">Name:</span> {horse.farrier.name}
                  </p>
                  {horse.farrier.mobile_phone && (
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Mobile:</span> {horse.farrier.mobile_phone}
                    </p>
                  )}
                  {horse.farrier.office_phone && (
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Office:</span> {horse.farrier.office_phone}
                    </p>
                  )}
                  {horse.farrier.address && (
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Address:</span> {horse.farrier.address}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No farrier assigned</p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Fingerprint className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Identification</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Microchip ID</p>
                <p className="text-gray-900 font-mono mt-1">
                  {horse.microchip_id || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Registration Number</p>
                <p className="text-gray-900 mt-1">
                  {horse.registration_number || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {(horse.medical_notes || horse.dietary_requirements) && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Care Information</h3>
              </div>

              {horse.medical_notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Medical Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{horse.medical_notes}</p>
                  </div>
                </div>
              )}

              {horse.dietary_requirements && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Dietary Requirements</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {horse.dietary_requirements}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                <p>Created: {formatDate(horse.created_at)}</p>
                <p className="mt-1">Last Updated: {formatDate(horse.updated_at)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onDelete}
              className="flex items-center space-x-2 px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium transition"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Horse</span>
            </button>
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Horse</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
