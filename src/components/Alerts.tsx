import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

interface Alert {
  id: number;
  entity_id: string;
  name: string;
  condition: string;
  threshold: string;
  enabled: number;
  last_triggered: string | null;
}

interface AlertHistory {
  id: number;
  alert_name: string;
  entity_id: string;
  state_value: string;
  triggered_at: string;
}

interface AlertsProps {
  entities: string[];
}

export function Alerts({ entities }: AlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [formData, setFormData] = useState({
    entity_id: '',
    name: '',
    condition: 'above',
    threshold: '',
    enabled: true
  });

  useEffect(() => {
    loadAlerts();
    loadHistory();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/alerts/history?limit=10');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAlert) {
        await fetch(`http://localhost:3000/api/alerts/${editingAlert.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('http://localhost:3000/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setShowForm(false);
      setEditingAlert(null);
      setFormData({ entity_id: '', name: '', condition: 'above', threshold: '', enabled: true });
      loadAlerts();
    } catch (error) {
      console.error('Failed to save alert:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this alert?')) return;
    try {
      await fetch(`http://localhost:3000/api/alerts/${id}`, { method: 'DELETE' });
      loadAlerts();
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setFormData({
      entity_id: alert.entity_id,
      name: alert.name,
      condition: alert.condition,
      threshold: alert.threshold,
      enabled: alert.enabled === 1
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Bell className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sensor Alerts</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Alert
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAlert ? 'Edit Alert' : 'New Alert'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAlert(null);
                  setFormData({ entity_id: '', name: '', condition: 'above', threshold: '', enabled: true });
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alert Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity</label>
                <select
                  value={formData.entity_id}
                  onChange={e => setFormData({ ...formData, entity_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an entity</option>
                  {entities.map(id => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={formData.condition}
                  onChange={e => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                  <option value="equals">Equals</option>
                  <option value="not_equals">Not Equals</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
                <input
                  type="text"
                  value={formData.threshold}
                  onChange={e => setFormData({ ...formData, threshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                  Enabled
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  {editingAlert ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAlert(null);
                    setFormData({ entity_id: '', name: '', condition: 'above', threshold: '', enabled: true });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-sm">No alerts configured</p>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{alert.name}</span>
                      {alert.enabled ? (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {alert.entity_id} {alert.condition} {alert.threshold}
                    </p>
                    {alert.last_triggered && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last: {new Date(alert.last_triggered).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(alert)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Triggers</h3>
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm">No alerts triggered yet</p>
            ) : (
              history.map(item => (
                <div key={item.id} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="font-medium text-gray-900">{item.alert_name}</div>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.entity_id}: {item.state_value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.triggered_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
