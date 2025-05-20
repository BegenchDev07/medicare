import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, UserPlus, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { apiGet } from '../../utils/api';
import { AppointmentStatus, Appointment } from '../../types';
import { format, parseISO } from 'date-fns';

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
}

const PatientDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchUpcomingAppointments()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiGet<DashboardStats>('/patient/stats');
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await apiGet<Appointment[]>('/appointments/patient');
      if (response.success && response.data) {
        const upcoming = response.data.filter(
          appointment => 
            appointment.status !== AppointmentStatus.CANCELLED &&
            appointment.status !== AppointmentStatus.COMPLETED &&
            new Date(`${appointment.date}T${appointment.start_time}`) >= new Date()
        ).slice(0, 5);
        setUpcomingAppointments(upcoming);
      }
    } catch (error) {
      console.error('Failed to fetch upcoming appointments:', error);
    }
  };

  const statCards = [
    {
      title: 'Upcoming Appointments',
      value: stats.upcomingAppointments,
      icon: <Calendar className="h-6 w-6 text-primary-500" />,
      onClick: () => navigate('/patient/appointments'),
      color: 'blue',
    },
    {
      title: 'Pending Appointments',
      value: stats.pendingAppointments,
      icon: <Clock className="h-6 w-6 text-warning-500" />,
      color: 'yellow',
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: <UserPlus className="h-6 w-6 text-success-500" />,
      color: 'green',
    },
    {
      title: 'Completed Appointments',
      value: stats.completedAppointments,
      icon: <CheckCircle className="h-6 w-6 text-error-500" />,
      color: 'red',
    },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your appointments and medical schedule
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat:any, index:number) => (
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

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            className="cursor-pointer hover:shadow-lg transform transition-all duration-200 hover:scale-105"
            onClick={() => navigate('/patient/doctors')}
          >
            <div className="flex items-center p-4">
              <UserPlus className="h-6 w-6 text-primary-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Find Doctors</h3>
                <p className="text-sm text-gray-500">Book an appointment</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transform transition-all duration-200 hover:scale-105"
            onClick={() => navigate('/patient/appointments')}
          >
            <div className="flex items-center p-4">
              <Calendar className="h-6 w-6 text-primary-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">My Appointments</h3>
                <p className="text-sm text-gray-500">View and manage appointments</p>
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

      {/* Upcoming Appointments */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
          <Button
            variant="primary"
            size="sm"
            icon={<Calendar size={16} />}
            onClick={() => navigate('/patient/doctors')}
          >
            Book Appointment
          </Button>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(parseISO(appointment.date), 'PPP')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.start_time} - {appointment.end_time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {appointment.doctorName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.status === AppointmentStatus.PENDING
                            ? 'bg-warning-100 text-warning-800'
                            : 'bg-success-100 text-success-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/patient/appointments')}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No upcoming appointments
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;