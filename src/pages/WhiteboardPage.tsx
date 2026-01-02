import { useEffect, useState } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Calendar,
  Filter,
  Clock
} from 'lucide-react';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getHorses,
  Activity,
  Horse
} from '../services/api';
import { Modal } from '../components/Modal';

const ACTIVITY_TYPES = [
  { value: 'feeding', label: 'Feeding', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'training', label: 'Training', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'vet_visit', label: 'Vet Visit', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'farrier_visit', label: 'Farrier Visit', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'grooming', label: 'Grooming', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'exercise', label: 'Exercise', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'medication', label: 'Medication', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  { value: 'custom', label: 'Custom', color: 'bg-gray-100 text-gray-800 border-gray-300' }
];

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function WhiteboardPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterHorseId, setFilterHorseId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [activitiesData, horsesData] = await Promise.all([
        getActivities(),
        getHorses()
      ]);
      setActivities(activitiesData);
      setHorses(horsesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  function getWeekDays(weekStart: Date): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  function getActivitiesForDay(date: Date): Activity[] {
    const dateStr = formatDate(date);
    return activities
      .filter(activity => {
        const activityDate = formatDate(new Date(activity.scheduled_start));
        const matchesDate = activityDate === dateStr;
        const matchesFilter = !filterHorseId || activity.horse_id === filterHorseId;
        return matchesDate && matchesFilter;
      })
      .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime());
  }

  const handlePreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const handleAddActivity = (date?: Date) => {
    setSelectedDate(date || null);
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      await deleteActivity(id);
      loadData();
    } catch (error) {
      alert('Failed to delete activity');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const scheduledDate = formData.get('scheduled_date') as string;
    const scheduledTime = formData.get('scheduled_time') as string;
    const duration = parseInt(formData.get('duration') as string) || 60;

    const scheduledStart = new Date(`${scheduledDate}T${scheduledTime}`);
    const scheduledEnd = new Date(scheduledStart.getTime() + duration * 60000);

    const activityData: Activity = {
      title: formData.get('title') as string,
      activity_type: formData.get('activity_type') as Activity['activity_type'],
      horse_id: (formData.get('horse_id') as string) || undefined,
      scheduled_start: scheduledStart.toISOString(),
      scheduled_end: scheduledEnd.toISOString(),
      assigned_to: formData.get('assigned_to') as string || undefined,
      notes: formData.get('notes') as string || undefined,
      status: 'scheduled'
    };

    try {
      if (editingActivity?.id) {
        await updateActivity(editingActivity.id, activityData);
      } else {
        await createActivity(activityData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      alert('Failed to save activity');
    }
  };

  const getActivityTypeColor = (type: string) => {
    return ACTIVITY_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getActivityTypeLabel = (type: string) => {
    return ACTIVITY_TYPES.find(t => t.value === type)?.label || type;
  };

  const weekDays = getWeekDays(currentWeekStart);
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Whiteboard</h1>
          <p className="text-gray-600 mt-1">Weekly activity calendar for all horses</p>
        </div>
        <button
          onClick={() => handleAddActivity()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Activity</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={handleToday}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Today
                </button>
                <button
                  onClick={handleNextWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="flex items-center space-x-2 text-gray-900">
                <Calendar className="h-5 w-5" />
                <span className="font-semibold">
                  {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  {' - '}
                  {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filterHorseId}
                onChange={(e) => setFilterHorseId(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Horses</option>
                {horses.map(horse => (
                  <option key={horse.id} value={horse.id}>{horse.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {weekDays.map((day, index) => {
            const dayActivities = getActivitiesForDay(day);
            const today = isToday(day);

            return (
              <div key={index} className={`min-h-[500px] ${today ? 'bg-blue-50' : ''}`}>
                <div className={`p-3 border-b ${today ? 'bg-blue-100 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="text-center">
                    <div className={`text-xs font-medium ${today ? 'text-blue-900' : 'text-gray-600'}`}>
                      {DAYS_OF_WEEK[index]}
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${today ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-2">
                  {dayActivities.length === 0 ? (
                    <button
                      onClick={() => handleAddActivity(day)}
                      className="w-full p-4 text-center text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition"
                    >
                      <Plus className="h-4 w-4 mx-auto mb-1" />
                      Add Activity
                    </button>
                  ) : (
                    <>
                      {dayActivities.map(activity => {
                        const horse = horses.find(h => h.id === activity.horse_id);
                        return (
                          <div
                            key={activity.id}
                            className={`p-2 rounded-lg border ${getActivityTypeColor(activity.activity_type)} hover:shadow-md transition cursor-pointer group`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-1 mb-1">
                                  <Clock className="h-3 w-3 flex-shrink-0" />
                                  <span className="text-xs font-medium">
                                    {formatTime(activity.scheduled_start)}
                                  </span>
                                </div>
                                <div className="text-sm font-semibold truncate">
                                  {activity.title}
                                </div>
                                {horse && (
                                  <div className="text-xs mt-1 truncate">
                                    {horse.name}
                                  </div>
                                )}
                                <div className="text-xs mt-1 opacity-75">
                                  {getActivityTypeLabel(activity.activity_type)}
                                </div>
                              </div>
                              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditActivity(activity);
                                  }}
                                  className="p-1 hover:bg-white rounded transition"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteActivity(activity.id!);
                                  }}
                                  className="p-1 hover:bg-white rounded transition"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => handleAddActivity(day)}
                        className="w-full p-2 text-center text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg border border-dashed border-gray-200 hover:border-gray-300 transition"
                      >
                        <Plus className="h-3 w-3 mx-auto" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Activity Types</h3>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TYPES.map(type => (
            <div key={type.value} className={`px-3 py-1 rounded-lg border text-sm ${type.color}`}>
              {type.label}
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingActivity ? 'Edit Activity' : 'Add Activity'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              defaultValue={editingActivity?.title}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type *
            </label>
            <select
              name="activity_type"
              defaultValue={editingActivity?.activity_type || 'training'}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ACTIVITY_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horse
            </label>
            <select
              name="horse_id"
              defaultValue={editingActivity?.horse_id || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No specific horse</option>
              {horses.map(horse => (
                <option key={horse.id} value={horse.id}>{horse.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="scheduled_date"
                defaultValue={
                  editingActivity
                    ? formatDate(new Date(editingActivity.scheduled_start))
                    : selectedDate
                    ? formatDate(selectedDate)
                    : formatDate(new Date())
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                name="scheduled_time"
                defaultValue={
                  editingActivity
                    ? new Date(editingActivity.scheduled_start).toTimeString().slice(0, 5)
                    : '09:00'
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              defaultValue={
                editingActivity && editingActivity.scheduled_end
                  ? Math.round(
                      (new Date(editingActivity.scheduled_end).getTime() -
                        new Date(editingActivity.scheduled_start).getTime()) /
                        60000
                    )
                  : 60
              }
              min="5"
              step="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <input
              type="text"
              name="assigned_to"
              defaultValue={editingActivity?.assigned_to}
              placeholder="Staff member name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              defaultValue={editingActivity?.notes}
              rows={3}
              placeholder="Additional details, special instructions, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {editingActivity ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
