import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Search, XCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { apiGet, apiDelete } from '../../utils/api';
import { Appointment, AppointmentStatus } from '../../types';
import { format, parseISO } from 'date-fns';

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');
  const location = useLocation();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await apiGet<Appointment[]>('/appointments/patient');
      if (response.success && response.data) {
        setAppointments(response.data);
      } else {
        setError(response.error || 'Failed to fetch appointments');
      }
    } catch (error) {
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await apiDelete(`/appointments/${appointmentId}`);
      if (response.success) {
        setAppointments(appointments.filter(appointment => appointment.id !== appointmentId));
      } else {
        setError(response.error || 'Failed to cancel appointment');
      }
    } catch (error) {
      setError('Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments
    .filter(appointment =>
      filter === 'all' || appointment.status === filter
    )
    .filter(appointment =>
      appointment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(parseISO(appointment.date), 'PPP').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusBadgeColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'bg-warning-100 text-warning-800';
      case AppointmentStatus.CONFIRMED:
        return 'bg-primary-100 text-primary-800';
      case AppointmentStatus.COMPLETED:
        return 'bg-success-100 text-success-800';
      case AppointmentStatus.CANCELLED:
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your appointments
        </p>
      </div>

      {location.state?.message && (
        <Alert
          type="success"
          message={location.state.message}
          className="mb-6"
        />
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
        />
      )}

      <Card className="mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center w-full sm:w-auto">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                className="ml-2 flex-1 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Filter:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as AppointmentStatus | 'all')}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
              >
                <option value="all">All</option>
                {Object.values(AppointmentStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Dr. {appointment.doctorName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                      {appointment.categoryName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(parseISO(appointment.date), 'PPP')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.startTime} - {appointment.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {appointment.notes || 'No notes'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(appointment.status === AppointmentStatus.PENDING || 
                      appointment.status === AppointmentStatus.CONFIRMED) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<XCircle size={16} />}
                        className="text-error-600 hover:text-error-800"
                        onClick={() => handleCancel(appointment.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MyAppointments;