import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { Toast } from '../components/Toast';

interface Horse {
  id: string;
  name: string;
}

interface Activity {
  id: string;
  horse_id: string;
  title: string;
  description: string;
  activity_type: string;
  scheduled_date: string;
  scheduled_time: string | null;
  duration_minutes: number;
  assigned_to: string;
  status: string;
  notes: string;
  horses: { name: string };
}

interface ActivityFormData {
  horse_id: string;
  title: string;
  description: string;
  activity_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  assigned_to: string;
  status: string;
  notes: string;
}

const activityTypes = [
  { value: 'training', label: 'Training', color: 'bg-blue-100 text-blue-800' },
  { value: 'feeding', label: 'Feeding', color: 'bg-green-100 text-green-800' },
  { value: 'vet', label: 'Vet', color: 'bg-red-100 text-red-800' },
  { value: 'farrier', label: 'Farrier', color: 'bg-purple-100 text-purple-800' },
  { value: 'grooming', label: 'Grooming', color: 'bg-pink-100 text-pink-800' },
  { value: 'turnout', label: 'Turnout', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'medication', label: 'Medication', color: 'bg-orange-100 text-orange-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
];

export function Whiteboard() {
  const { user } = useAuth();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<ActivityFormData>({
    horse_id: '',
    title: '',
    description: '',
    activity_type: 'training',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 30,
    assigned_to: '',
    status: 'planned',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [currentWeekStart]);

  async function fetchData() {
    try {
      setLoading(true);

      const { data: horsesData, error: horsesError } = await supabase
        .from('horses')
        .select('id, name')
        .order('name');

      if (horsesError) throw horsesError;
      setHorses(horsesData || []);

      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select(`
          *,
          horses(name)
        `)
        .gte('scheduled_date', currentWeekStart.toISOString().split('T')[0])
        .lt('scheduled_date', weekEnd.toISOString().split('T')[0])
        .order('scheduled_time');

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function getWeekDays() {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }

  function getActivitiesForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return activities.filter(a => a.scheduled_date === dateStr);
  }

  function navigateWeek(direction: number) {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeekStart(newDate);
  }

  function openModal(date?: Date, activity?: Activity) {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        horse_id: activity.horse_id,
        title: activity.title,
        description: activity.description,
        activity_type: activity.activity_type,
        scheduled_date: activity.scheduled_date,
        scheduled_time: activity.scheduled_time || '',
        duration_minutes: activity.duration_minutes,
        assigned_to: activity.assigned_to,
        status: activity.status,
        notes: activity.notes,
      });
    } else {
      setEditingActivity(null);
      setFormData({
        horse_id: '',
        title: '',
        description: '',
        activity_type: 'training',
        scheduled_date: date ? date.toISOString().split('T')[0] : '',
        scheduled_time: '',
        duration_minutes: 30,
        assigned_to: '',
        status: 'planned',
        notes: '',
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingActivity(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingActivity) {
        const { error } = await supabase
          .from('activities')
          .update({
            ...formData,
            scheduled_time: formData.scheduled_time || null,
          })
          .eq('id', editingActivity.id);

        if (error) throw error;
        setToast({ message: 'Activity updated successfully', type: 'success' });
      } else {
        const { error } = await supabase
          .from('activities')
          .insert([{
            ...formData,
            user_id: user?.id,
            scheduled_time: formData.scheduled_time || null,
          }]);

        if (error) throw error;
        setToast({ message: 'Activity created successfully', type: 'success' });
      }

      closeModal();
      fetchData();
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    }
  }

  async function deleteActivity(id: string) {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setToast({ message: 'Activity deleted successfully', type: 'success' });
      fetchData();
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    }
  }

  async function toggleActivityStatus(activity: Activity) {
    const newStatus = activity.status === 'completed' ? 'planned' : 'completed';

    try {
      const { error } = await supabase
        .from('activities')
        .update({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', activity.id);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    }
  }

  function getActivityTypeColor(type: string) {
    return activityTypes.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading whiteboard...</div>
      </div>
    );
  }

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Whiteboard</h1>
          <p className="text-gray-600 mt-1">Weekly overview of all horses and activities</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Activity
        </button>
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <button
          onClick={() => navigateWeek(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-lg font-semibold text-gray-900">
          Week of {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>

        <button
          onClick={() => navigateWeek(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((date, index) => {
          const dayActivities = getActivitiesForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <div className={`p-4 text-center ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="text-sm font-medium">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-2xl font-bold">
                  {date.getDate()}
                </div>
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {dayActivities.map(activity => (
                  <div
                    key={activity.id}
                    className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                      activity.status === 'completed' ? 'opacity-60 bg-gray-50' : 'bg-white shadow-sm'
                    }`}
                    onClick={() => openModal(undefined, activity)}
                    style={{
                      borderLeftColor: activityTypes.find(t => t.value === activity.activity_type)?.color.includes('blue') ? '#3B82F6' :
                                       activityTypes.find(t => t.value === activity.activity_type)?.color.includes('green') ? '#10B981' :
                                       activityTypes.find(t => t.value === activity.activity_type)?.color.includes('red') ? '#EF4444' :
                                       activityTypes.find(t => t.value === activity.activity_type)?.color.includes('purple') ? '#A855F7' :
                                       activityTypes.find(t => t.value === activity.activity_type)?.color.includes('pink') ? '#EC4899' :
                                       activityTypes.find(t => t.value === activity.activity_type)?.color.includes('yellow') ? '#F59E0B' :
                                       activityTypes.find(t => t.value === activity.activity_type)?.color.includes('orange') ? '#F97316' : '#6B7280'
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {activity.horses.name}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {activity.title}
                        </div>
                        {activity.scheduled_time && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3" />
                            {activity.scheduled_time.slice(0, 5)}
                          </div>
                        )}
                        {activity.assigned_to && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <User className="w-3 h-3" />
                            {activity.assigned_to}
                          </div>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={activity.status === 'completed'}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleActivityStatus(activity);
                        }}
                        className="mt-1 w-4 h-4 rounded border-gray-300"
                      />
                    </div>
                    <div className={`inline-block px-2 py-1 text-xs rounded mt-2 ${getActivityTypeColor(activity.activity_type)}`}>
                      {activityTypes.find(t => t.value === activity.activity_type)?.label}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => openModal(date)}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingActivity ? 'Edit Activity' : 'Add Activity'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horse *
                    </label>
                    <select
                      required
                      value={formData.horse_id}
                      onChange={(e) => setFormData({ ...formData, horse_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a horse</option>
                      {horses.map(horse => (
                        <option key={horse.id} value={horse.id}>{horse.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Type *
                    </label>
                    <select
                      required
                      value={formData.activity_type}
                      onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {activityTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Dressage Training"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed description of the activity"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Team member name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes or observations"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingActivity ? 'Update Activity' : 'Create Activity'}
                  </button>
                  {editingActivity && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteActivity(editingActivity.id);
                        closeModal();
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}