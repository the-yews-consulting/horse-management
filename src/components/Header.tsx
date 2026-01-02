import { useNavigate } from 'react-router-dom';
import { useHomeAssistant } from '../contexts/HomeAssistantContext';
import { useAuth } from '../contexts/AuthContext';
import { Home, LogOut, Wifi, WifiOff, AlertCircle, User } from 'lucide-react';

export function Header() {
  const { isConnected, error } = useHomeAssistant();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <Wifi className="h-5 w-5 text-green-600" />
                  <span className="hidden sm:inline text-sm text-gray-700 font-medium">
                    Connected
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <WifiOff className="h-5 w-5 text-red-600" />
                  <span className="hidden sm:inline text-sm text-gray-700 font-medium">
                    Disconnected
                  </span>
                </>
              )}
            </div>

            {user && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="hidden sm:inline text-sm text-gray-700 font-medium">
                  {user.full_name}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700 font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="pb-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
