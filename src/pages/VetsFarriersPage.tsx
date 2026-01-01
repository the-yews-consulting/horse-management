export function VetsFarriersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vets & Farriers</h1>
        <p className="text-gray-600 mt-1">Manage veterinarians and farriers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Veterinarians</h2>
          <p className="text-gray-500 text-center">No vets added yet.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Farriers</h2>
          <p className="text-gray-500 text-center">No farriers added yet.</p>
        </div>
      </div>
    </div>
  );
}
