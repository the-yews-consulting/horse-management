import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle, XCircle, Loader } from 'lucide-react';

export function Settings() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const urlResponse = await fetch('/api/config/ha_url');
      const urlData = await urlResponse.json();
      setUrl(urlData.value || '');

      const tokenResponse = await fetch('/api/config/ha_token');
      const tokenData = await tokenResponse.json();
      setToken(tokenData.value || '');
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch('/api/config/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, token })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSaveMessage('Settings saved successfully');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage(data.error || 'Failed to save settings');
      }
    } catch (error) {
      setSaveMessage('Failed to save settings: Network error');
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const saveResponse = await fetch('/api/config/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, token })
      });

      const saveData = await saveResponse.json();

      if (saveResponse.ok && saveData.success) {
        setTestResult({ success: true, message: 'Connection successful' });
      } else {
        setTestResult({ success: false, message: saveData.error || 'Connection failed' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      setTestResult({ success: false, message: errorMessage });
      console.error('Failed to test connection:', error);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Home Assistant Configuration</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-instance.ui.nabu.casa or http://localhost:8123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter your Nabu Casa URL for remote access or local URL (e.g., http://localhost:8123)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Long-lived access token"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="mt-2 text-sm text-gray-500">
              Generate a long-lived access token from your Home Assistant profile
            </p>
          </div>

          {testResult && (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg ${
                testResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  testResult.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {testResult.message}
              </span>
            </div>
          )}

          {saveMessage && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">{saveMessage}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleTest}
              disabled={testing || !url || !token}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Test Connection
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !url || !token}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Quick Setup Examples</h4>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>Remote Access (Nabu Casa):</strong>
            <code className="block mt-1 p-2 bg-white rounded border border-blue-200 text-xs">
              https://your-instance.ui.nabu.casa
            </code>
          </div>
          <div>
            <strong>Local Access:</strong>
            <code className="block mt-1 p-2 bg-white rounded border border-blue-200 text-xs">
              http://localhost:8123
            </code>
            <p className="mt-1 text-xs">or your local IP like http://192.168.1.100:8123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
