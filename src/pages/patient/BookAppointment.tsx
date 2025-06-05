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
import { Doctor, TimeSlot, DaySchedule, Schedule, Appointment } from '../../types';
import { format, parseISO, addDays } from 'date-fns';

const BookAppointment: React.FC = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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
        fetchDoctorSchedules(),
        fetchDoctorAppointments()
      ]).finally(() => setLoading(false));
    }
  }, [doctorId]);

  useEffect(() => {
    if (schedules.length > 0 && appointments.length > 0) {
      generateAvailableSlots();
    }
  }, [schedules, appointments]);

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

  const fetchDoctorSchedules = async () => {
    try {
      const response = await apiGet<Schedule[]>(`/schedules/doctor/${doctorId}/available`);
      if (response.success && response.data) {
        setSchedules(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch doctor schedules');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch schedules');
    }
  };

  const fetchDoctorAppointments = async () => {
    try {
      const response = await apiGet<Appointment[]>(`/appointments/doctor/${doctorId}`);
      if (response.success && response.data) {
        setAppointments(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch appointments');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch appointments');
    }
  };

  const generateTimeSlots = (startTime: string, endTime: string, date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    let currentTime = startTime;

    while (currentTime < endTime) {
      // Remove seconds from the time
      const formattedTime = currentTime.split(':').slice(0, 2).join(':');
      
      // Check if the slot is already booked
      const isBooked = appointments.some(appointment => 
        appointment.date === date &&
        appointment.start_time === formattedTime &&
        appointment.status !== 'cancelled'
      );

      slots.push({
        time: formattedTime,
        available: !isBooked
      });

      // Add 30 minutes
      const [hours, minutes] = currentTime.split(':').map(Number);
      const newMinutes = minutes + 30;
      const newHours = hours + Math.floor(newMinutes / 60);
      currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes % 60).padStart(2, '0')}`;
    }

    return slots;
  };

  const generateAvailableSlots = () => {
    const nextWeekSlots = Array.from({ length: 7 }, (_, i) => {
      const date = format(addDays(new Date(), i), 'yyyy-MM-dd');
      
      // Find schedule for this day
      const daySchedule = schedules.find(s => format(parseISO(s.day), 'yyyy-MM-dd') === date);
      
      if (!daySchedule || !daySchedule.is_available) {
        return {
          date,
          slots: []
        };
      }

      // Remove seconds from the time
      const startTime = daySchedule.start_time.split(':').slice(0, 2).join(':');
      const endTime = daySchedule.end_time.split(':').slice(0, 2).join(':');

      // Generate slots for the day's schedule
      return {
        date,
        slots: generateTimeSlots(startTime, endTime, date)
      };
    });

    setAvailableSlots(nextWeekSlots);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !user || !doctorId) {
      setError('Please select both date and time');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Calculate end time (30 minutes after start time)
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const endMinutes = minutes + 30;
      const endHours = hours + Math.floor(endMinutes / 60);
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

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
                      onClick={() => daySchedule.slots.length > 0 && setSelectedDate(daySchedule.date)}
                      className={`
                        rounded-lg p-3 text-center
                        ${daySchedule.slots.length === 0 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'cursor-pointer hover:border-primary-300'
                        }
                        ${selectedDate === daySchedule.date
                          ? 'bg-primary-100 border-2 border-primary-500'
                          : 'bg-gray-50 border border-gray-200'
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
                      ?.slots.map((slot, index) => (
                        <div
                          key={index}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          className={`
                            p-2 text-center rounded-md cursor-pointer
                            ${!slot.available 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : selectedTime === slot.time
                                ? 'bg-primary-100 text-primary-800 border-2 border-primary-500'
                                : 'bg-gray-50 text-gray-900 border border-gray-200 hover:border-primary-300'
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