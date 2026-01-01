export function HorsesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Horses</h1>
        <p className="text-gray-600 mt-1">Manage your horses</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500">No horses added yet. Add your first horse to get started.</p>
      </div>
    </div>
  );
}
