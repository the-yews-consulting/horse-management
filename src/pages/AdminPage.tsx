import { useState } from 'react';
import { HorseListManager } from '../components/HorseListManager';

export function AdminPage() {
  const [activeMainTab, setActiveMainTab] = useState('users');
  const [activeListTab, setActiveListTab] = useState('breeds');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
        <p className="text-gray-600 mt-1">User management and system settings</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveMainTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeMainTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveMainTab('horseLists')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeMainTab === 'horseLists'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Horses Lists
          </button>
        </nav>
      </div>

      {activeMainTab === 'users' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
          <p className="text-gray-500 text-center">User management interface coming soon.</p>
        </div>
      )}

      {activeMainTab === 'horseLists' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveListTab('breeds')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeListTab === 'breeds'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Horse Breed
              </button>
              <button
                onClick={() => setActiveListTab('colours')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeListTab === 'colours'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Horse Colour
              </button>
              <button
                onClick={() => setActiveListTab('genders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeListTab === 'genders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Horse Gender
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeListTab === 'breeds' && (
              <HorseListManager listType="breeds" title="Horse Breed" />
            )}
            {activeListTab === 'colours' && (
              <HorseListManager listType="colours" title="Horse Colour" />
            )}
            {activeListTab === 'genders' && (
              <HorseListManager listType="genders" title="Horse Gender" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
