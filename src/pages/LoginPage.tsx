import { useState } from 'react';
import { useHomeAssistant } from '../contexts/HomeAssistantContext';
import { Home, Lock, AlertCircle, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { connect, isConnecting, error } = useHomeAssistant();
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!url.trim()) {
      setFormError('Please enter your Home Assistant URL');
      return;
    }

    if (!token.trim()) {
      setFormError('Please enter your access token');
      return;
    }

    try {
      await connect({ url: url.trim(), token: token.trim() });
    } catch (err) {
      setFormError('Failed to connect. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Home className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Home Assistant Dashboard</h1>
          <p className="text-blue-100">Connect to your Home Assistant instance</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Home Assistant URL
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="homeassistant.local:8123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={isConnecting}
              />
              <p className="mt-2 text-sm text-gray-500">
                Example: homeassistant.local:8123 or 192.168.1.100:8123
              </p>
            </div>

            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                Long-Lived Access Token
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your access token"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={isConnecting}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Create one in your Home Assistant profile settings
              </p>
            </div>

            {(error || formError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  {formError || error}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isConnecting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Connect</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">How to get started:</h3>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Open your Home Assistant instance</li>
              <li>Go to Profile → Long-Lived Access Tokens</li>
              <li>Create a new token and copy it</li>
              <li>Paste it here along with your HA URL</li>
            </ol>
          </div>
        </div>

        <div className="text-center mt-6 text-blue-100 text-sm">
          <p>Your credentials are stored locally in your browser</p>
        </div>
      </div>
    </div>
  );
}
