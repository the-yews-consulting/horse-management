import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { HorseList } from './pages/HorseList';
import { HorseForm } from './pages/HorseForm';
import { HorseDetail } from './pages/HorseDetail';
import { OwnerList } from './pages/OwnerList';
import { VetList } from './pages/VetList';
import { FarrierList } from './pages/FarrierList';
import { StallList } from './pages/StallList';
import { StallForm } from './pages/StallForm';
import { StallDetail } from './pages/StallDetail';
import { Whiteboard } from './pages/Whiteboard';
import { Admin } from './pages/Admin';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Toast } from './components/Toast';
import { HorseWithOwner, StallWithAssignment } from './types/database';
import { supabase } from './lib/supabase';
import { Users, Home, DoorOpen, LayoutDashboard, Stethoscope, Hammer, CalendarDays, Settings } from 'lucide-react';

type View = 'dashboard' | 'horses' | 'owners' | 'stalls' | 'vets' | 'farriers' | 'whiteboard' | 'admin';

function AppContent() {
  const { user, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedHorse, setSelectedHorse] = useState<HorseWithOwner | null>(null);
  const [showHorseForm, setShowHorseForm] = useState(false);
  const [showHorseDetail, setShowHorseDetail] = useState(false);
  const [horseToEdit, setHorseToEdit] = useState<HorseWithOwner | undefined>(undefined);
  const [horseToDelete, setHorseToDelete] = useState<HorseWithOwner | null>(null);
  const [selectedStall, setSelectedStall] = useState<StallWithAssignment | null>(null);
  const [showStallForm, setShowStallForm] = useState(false);
  const [showStallDetail, setShowStallDetail] = useState(false);
  const [stallToEdit, setStallToEdit] = useState<StallWithAssignment | undefined>(undefined);
  const [stallToDelete, setStallToDelete] = useState<StallWithAssignment | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!user) {
    return <Login />;
  }

  const handleAddHorse = () => {
    setHorseToEdit(undefined);
    setShowHorseForm(true);
  };

  const handleEditHorse = (horse: HorseWithOwner) => {
    setHorseToEdit(horse);
    setShowHorseDetail(false);
    setShowHorseForm(true);
  };

  const handleViewHorse = (horse: HorseWithOwner) => {
    setSelectedHorse(horse);
    setShowHorseDetail(true);
  };

  const handleDeleteHorse = (horse: HorseWithOwner) => {
    setHorseToDelete(horse);
  };

  const confirmDelete = async () => {
    if (!horseToDelete) return;

    try {
      const { error } = await supabase
        .from('horses')
        .delete()
        .eq('id', horseToDelete.id);

      if (error) throw error;

      setToast({ message: 'Horse deleted successfully', type: 'success' });
      setHorseToDelete(null);
      setShowHorseDetail(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      setToast({ message: 'Failed to delete horse', type: 'error' });
    }
  };

  const handleSaveHorse = () => {
    setShowHorseForm(false);
    setToast({
      message: horseToEdit ? 'Horse updated successfully' : 'Horse added successfully',
      type: 'success',
    });
    setRefreshKey(prev => prev + 1);
  };

  const handleAddStall = () => {
    setStallToEdit(undefined);
    setShowStallForm(true);
  };

  const handleEditStall = (stall: StallWithAssignment) => {
    setStallToEdit(stall);
    setShowStallDetail(false);
    setShowStallForm(true);
  };

  const handleViewStall = (stall: StallWithAssignment) => {
    setSelectedStall(stall);
    setShowStallDetail(true);
  };

  const handleDeleteStall = (stall: StallWithAssignment) => {
    setStallToDelete(stall);
  };

  const confirmDeleteStall = async () => {
    if (!stallToDelete) return;

    try {
      const { error } = await supabase
        .from('stalls')
        .delete()
        .eq('id', stallToDelete.id);

      if (error) throw error;

      setToast({ message: 'Stall deleted successfully', type: 'success' });
      setStallToDelete(null);
      setShowStallDetail(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      setToast({ message: 'Failed to delete stall', type: 'error' });
    }
  };

  const handleSaveStall = () => {
    setShowStallForm(false);
    setToast({
      message: stallToEdit ? 'Stall updated successfully' : 'Stall added successfully',
      type: 'success',
    });
    setRefreshKey(prev => prev + 1);
  };

  const handleStallUpdate = () => {
    setShowStallDetail(false);
    setToast({ message: 'Boarding assignment updated', type: 'success' });
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="mb-6">
          <div className="flex space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1 inline-flex">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView('horses')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition ${
                currentView === 'horses'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Horses</span>
            </button>
            <button
              onClick={() => setCurrentView('stalls')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition ${
                currentView === 'stalls'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <DoorOpen className="h-4 w-4" />
              <span>Stalls</span>
            </button>
            <button
              onClick={() => setCurrentView('owners')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition ${
                currentView === 'owners'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Owners</span>
            </button>
            <button
              onClick={() => setCurrentView('vets')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition ${
                currentView === 'vets'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              <span>Vets</span>
            </button>
            <button
              onClick={() => setCurrentView('farriers')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition ${
                currentView === 'farriers'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Hammer className="h-4 w-4" />
              <span>Farriers</span>
            </button>
            <button
              onClick={() => setCurrentView('whiteboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition ${
                currentView === 'whiteboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              <span>Whiteboard</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>

        {currentView === 'dashboard' && (
          <Dashboard
            key={refreshKey}
            onAddHorse={handleAddHorse}
            onAddStall={handleAddStall}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'horses' && (
          <HorseList
            key={refreshKey}
            onAddHorse={handleAddHorse}
            onEditHorse={handleEditHorse}
            onViewHorse={handleViewHorse}
            onDeleteHorse={handleDeleteHorse}
          />
        )}

        {currentView === 'stalls' && (
          <StallList
            key={refreshKey}
            onAddStall={handleAddStall}
            onEditStall={handleEditStall}
            onViewStall={handleViewStall}
            onDeleteStall={handleDeleteStall}
          />
        )}

        {currentView === 'owners' && <OwnerList key={refreshKey} />}

        {currentView === 'vets' && <VetList key={refreshKey} />}

        {currentView === 'farriers' && <FarrierList key={refreshKey} />}

        {currentView === 'whiteboard' && <Whiteboard key={refreshKey} />}

        {currentView === 'admin' && <Admin key={refreshKey} />}

        {showHorseForm && (
          <HorseForm
            horse={horseToEdit}
            onClose={() => setShowHorseForm(false)}
            onSave={handleSaveHorse}
          />
        )}

        {showHorseDetail && selectedHorse && (
          <HorseDetail
            horse={selectedHorse}
            onClose={() => setShowHorseDetail(false)}
            onEdit={() => handleEditHorse(selectedHorse)}
            onDelete={() => handleDeleteHorse(selectedHorse)}
          />
        )}

        {showStallForm && (
          <StallForm
            stall={stallToEdit}
            onClose={() => setShowStallForm(false)}
            onSave={handleSaveStall}
          />
        )}

        {showStallDetail && selectedStall && (
          <StallDetail
            stall={selectedStall}
            onClose={() => setShowStallDetail(false)}
            onEdit={() => handleEditStall(selectedStall)}
            onDelete={() => handleDeleteStall(selectedStall)}
            onUpdate={handleStallUpdate}
          />
        )}

        {horseToDelete && (
          <DeleteConfirmModal
            title="Delete Horse"
            message={`Are you sure you want to delete ${horseToDelete.name}? This action cannot be undone.`}
            onConfirm={confirmDelete}
            onCancel={() => setHorseToDelete(null)}
          />
        )}

        {stallToDelete && (
          <DeleteConfirmModal
            title="Delete Stall"
            message={`Are you sure you want to delete ${stallToDelete.name}? This will also remove any boarding assignments.`}
            onConfirm={confirmDeleteStall}
            onCancel={() => setStallToDelete(null)}
          />
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
