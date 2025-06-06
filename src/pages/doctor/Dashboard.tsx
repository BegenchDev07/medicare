import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { apiGet } from '../../utils/api';
import { AppointmentStatus, Appointment } from '../../types';
import { format, parseISO } from 'date-fns';

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  todayAppointments: number;
}

const DoctorDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    todayAppointments: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchStats(), fetchTodayAppointments()]);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiGet<DashboardStats>('/doctor/stats');
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const response = await apiGet<Appointment[]>('/appointments/doctor');
      if (response.success && response.data) {
        // Filter appointments for today
        const today = format(new Date(), 'yyyy-MM-dd');
        const todaysAppointments = response.data.filter(
          appointment => format(parseISO(appointment.date), 'yyyy-MM-dd') === today
        );
        setTodayAppointments(todaysAppointments);
      }
    } catch (error) {
      console.error('Failed to fetch today\'s appointments:', error);
    }
  };

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

  const statCards = [
    {
      title: 'Today\'s Appointments',
      value: stats.todayAppointments,
      icon: <Calendar className="h-6 w-6 text-primary-500" />,
      onClick: () => navigate('/doctor/appointments'),
      color: 'blue',
    },
    {
      title: 'Pending Appointments',
      value: stats.pendingAppointments,
      icon: <Clock className="h-6 w-6 text-warning-500" />,
      onClick: () => navigate('/doctor/appointments'),
      color: 'yellow',
    },
    {
      title: 'Total Patients',
      value: stats.totalAppointments,
      icon: <Users className="h-6 w-6 text-success-500" />,
      color: 'green',
    },
    {
      title: 'Completed Appointments',
      value: stats.completedAppointments,
      icon: <CheckCircle className="h-6 w-6 text-error-500" />,
      color: 'red',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your appointments and schedule
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className={`cursor-pointer transform transition-all duration-200 hover:scale-105 ${
              stat.onClick ? 'hover:shadow-lg' : ''
            }`}
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`bg-${stat.color}-100 rounded-full p-3`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Today's Schedule Section */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Schedule</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAppointments.length > 0 ? (
                  todayAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.start_time} - {appointment.end_time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patientName}
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No appointments scheduled for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            className="cursor-pointer hover:shadow-lg transform transition-all duration-200 hover:scale-105"
            onClick={() => navigate('/doctor/schedule')}
          >
            <div className="flex items-center p-4">
              <Calendar className="h-6 w-6 text-primary-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Manage Schedule</h3>
                <p className="text-sm text-gray-500">Update your availability</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transform transition-all duration-200 hover:scale-105"
            onClick={() => navigate('/doctor/appointments')}
          >
            <div className="flex items-center p-4">
              <Users className="h-6 w-6 text-primary-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">View Appointments</h3>
                <p className="text-sm text-gray-500">Check your appointments</p>
              </div>
            </div>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transform transition-all duration-200 hover:scale-105">
            <div className="flex items-center p-4">
              <CheckCircle className="h-6 w-6 text-primary-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Update Profile</h3>
                <p className="text-sm text-gray-500">Manage your information</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;