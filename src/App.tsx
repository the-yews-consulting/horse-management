import { HomeAssistantProvider, useHomeAssistant } from './contexts/HomeAssistantContext';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { Header } from './components/Header';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isConnected, isConnecting } = useHomeAssistant();

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Connecting to Home Assistant...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1920px] mx-auto">
        <Dashboard />
      </main>
    </div>
  );
}

function App() {
  return (
    <HomeAssistantProvider>
      <AppContent />
    </HomeAssistantProvider>
  );
}

export default App;
