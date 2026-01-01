export function StallsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stalls</h1>
        <p className="text-gray-600 mt-1">Manage your stalls and assignments</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500">No stalls added yet. Add your first stall to get started.</p>
      </div>
    </div>
  );
}
