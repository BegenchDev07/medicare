import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import FormField from '../../components/common/FormField';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { apiGet, apiPost } from '../../utils/api';
import { Doctor, TimeSlot, DaySchedule } from '../../types';
import { format, parseISO, addDays } from 'date-fns';

const BookAppointment: React.FC = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<DaySchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (doctorId) {
      Promise.all([
        fetchDoctor(),
        fetchAvailableSlots()
      ]).finally(() => setLoading(false));
    }
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const response = await apiGet<Doctor>(`/doctors/${doctorId}`);
      if (response.success && response.data) {
        setDoctor(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch doctor details');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch doctor details');
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      // Generate next 7 days of slots
      const nextWeekSlots = Array.from({ length: 7 }, (_, i) => {
        const date = format(addDays(new Date(), i), 'yyyy-MM-dd');
        return {
          date,
          slots: Array.from({ length: 8 }, (_, j) => ({
            id: `${date}-${j}`,
            time: format(new Date().setHours(9 + j, 0, 0), 'HH:mm'),
            available: true
          }))
        };
      });
      setAvailableSlots(nextWeekSlots);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch available slots');
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !user || !doctorId) {
      setError('Please select both date and time');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const endTime = format(
        new Date(new Date(`${selectedDate}T${selectedTime}`).getTime() + 30 * 60000),
        'HH:mm'
      );

      const response = await apiPost('/appointments', {
        doctor_id: doctorId,
        date: selectedDate,
        start_time: selectedTime,
        end_time: endTime,
        notes,
      });

      if (response.success) {
        showNotification('success', 'Appointment booked successfully!');
        navigate('/patient/appointments');
      } else {
        throw new Error(response.error || 'Failed to book appointment');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert type="error" message="Doctor not found" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button
        variant="ghost"
        icon={<ArrowLeft size={18} />}
        onClick={() => navigate('/patient/doctors')}
        className="mb-6"
      >
        Back to Doctors
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctor Info */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="flex items-center">
              {doctor.avatar ? (
                <img
                  src={doctor.avatar}
                  alt={`${doctor.first_name} ${doctor.last_name}`}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl font-medium text-primary-600">
                    {doctor.first_name?.[0]}
                    {doctor.last_name?.[0]}
                  </span>
                </div>
              )}
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Dr. {doctor.first_name} {doctor.last_name}
                </h2>
                <p className="text-sm text-gray-500">{doctor.specialization}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-2">
                  {doctor.categoryName}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 text-sm">{doctor.bio || 'No bio available'}</p>
              
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{doctor.experience}+ years experience</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Appointment Booking */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Book Appointment</h2>

            {error && (
              <Alert
                type="error"
                message={error}
                className="mb-6"
              />
            )}

            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Select Date</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {availableSlots.map((daySchedule) => (
                    <div
                      key={daySchedule.date}
                      onClick={() => setSelectedDate(daySchedule.date)}
                      className={`
                        cursor-pointer rounded-lg p-3 text-center
                        ${selectedDate === daySchedule.date
                          ? 'bg-primary-100 border-2 border-primary-500'
                          : 'bg-gray-50 border border-gray-200 hover:border-primary-300'
                        }
                      `}
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {format(parseISO(daySchedule.date), 'EEE')}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {format(parseISO(daySchedule.date), 'd')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Select Time</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {availableSlots
                      .find(day => day.date === selectedDate)
                      ?.slots.map((slot) => (
                        <div
                          key={slot.id}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          className={`
                            p-2 text-center rounded-md cursor-pointer
                            ${!slot.available && 'opacity-50 cursor-not-allowed'}
                            ${selectedTime === slot.time
                              ? 'bg-primary-100 text-primary-800 border-2 border-primary-500'
                              : slot.available
                                ? 'bg-gray-50 text-gray-900 border border-gray-200 hover:border-primary-300'
                                : 'bg-gray-100 text-gray-500'
                            }
                          `}
                        >
                          {slot.time}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <FormField
                label="Additional Notes"
                name="notes"
                type="textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific concerns or information you'd like to share..."
              />

              <Button
                fullWidth
                isLoading={submitting}
                disabled={!selectedDate || !selectedTime}
                icon={<CalendarIcon size={18} />}
                onClick={handleBookAppointment}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;