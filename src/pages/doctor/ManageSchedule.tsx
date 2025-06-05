import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Plus, Trash2, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import FormField from '../../components/common/FormField';
import Alert from '../../components/common/Alert';
import AddScheduleModal from '../../components/doctor/AddScheduleModal';
import { apiGet, apiPost, apiDelete } from '../../utils/api';
import { Schedule, TimeSlot, DaySchedule } from '../../types';
import { format, parseISO, addDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const ManageSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchDoctorId();
  }, []);

  const fetchDoctorId = async () => {
    try {
      const response = await apiGet<{ id: string; user_id: string }[]>('/doctors');
      if (response.success && response.data) {
        const doctor = response.data.find(d => d.user_id === user?.id);
        if (doctor) {
          setDoctorId(doctor.id);
          fetchSchedules(doctor.id);
        } else {
          throw new Error('Doctor profile not found');
        }
      } else {
        throw new Error(response.error || 'Failed to fetch doctor profile');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch doctor profile');
      setLoading(false);
    }
  };

  const fetchSchedules = async (docId: string) => {
    try {
      const response = await apiGet<Schedule[]>(`/schedules/doctor/${docId}`);
      if (response.success && response.data) {
        setSchedules(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch schedules');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await apiDelete(`/schedules/${id}`);
      if (response.success) {
        setSchedules(schedules.filter(schedule => schedule.id !== id));
        showNotification('success', 'Schedule deleted successfully');
      } else {
        throw new Error(response.error || 'Failed to delete schedule');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete schedule');
    }
  };

  const handleAddSchedule = async (data: {
    day: string;
    start_time: string;
    end_time: string;
  }) => {
    if (!doctorId) {
      setError('Doctor ID not found');
      return;
    }

    try {
      const response = await apiPost('/schedules', {
        doctor_id: doctorId,
        ...data,
      });

      if (response.success) {
        showNotification('success', 'Schedule added successfully');
        fetchSchedules(doctorId);
      } else {
        throw new Error(response.error || 'Failed to add schedule');
      }
    } catch (error) {
      throw error;
    }
  };

  // Generate time slots from 9 AM to 5 PM
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Schedule</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set your availability and manage appointments
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={18} />}
        >
          Add Schedule
        </Button>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
        />
      )}

      {/* Weekly Schedule View */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }, (_, i) => {
              const date = addDays(new Date(), i);
              const daySchedules = schedules.filter(
                s => format(parseISO(s.day), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
              );

              return (
                <div
                  key={i}
                  className={`border rounded-lg p-4 ${
                    format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-center mb-4">
                    <p className="text-sm font-medium text-gray-500">
                      {format(date, 'EEE')}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(date, 'd')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="bg-white rounded-md p-2 shadow-sm border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-600">
                              {schedule.start_time} - {schedule.end_time}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 size={14} />}
                            onClick={() => handleDelete(schedule.id)}
                          />
                        </div>
                      </div>
                    ))}

                    {daySchedules.length === 0 && (
                      <p className="text-center text-sm text-gray-500">
                        No schedules
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Time Slots Grid */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Time Slots</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {timeSlots.map((time) => {
              const isAvailable = schedules.some(
                s =>
                  format(parseISO(s.day), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') &&
                  s.start_time <= time &&
                  s.end_time > time
              );

              return (
                <div
                  key={time}
                  className={`p-2 text-center rounded-md cursor-pointer ${
                    isAvailable
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {time}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {doctorId && (
        <AddScheduleModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSchedule}
          doctorId={doctorId}
        />
      )}
    </div>
  );
};

export default ManageSchedule;