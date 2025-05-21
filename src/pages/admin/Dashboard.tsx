import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, UserPlus, CheckCircle, Users, UserCog } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { apiGet } from '../../utils/api';

interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  todayAppointments: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    todayAppointments: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiGet<AdminStats>('/admin/stats');
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: <Users className="h-6 w-6 text-primary-500" />,
      onClick: () => navigate('/admin/patients'),
      color: 'blue',
    },
    {
      title: 'Registered Doctors',
      value: stats.totalDoctors,
      icon: <UserCog className="h-6 w-6 text-success-500" />,
      onClick: () => navigate('/admin/doctors'),
      color: 'green',
    },
    {
      title: 'Pending Appointments',
      value: stats.pendingAppointments,
      icon: <Clock className="h-6 w-6 text-warning-500" />,
      color: 'yellow',
    },
    {
      title: 'Completed Appointments',
      value: stats.completedAppointments,
      icon: <CheckCircle className="h-6 w-6 text-error-500" />,
      color: 'red',
    },
  ];

  const appointmentStats = [
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      color: 'primary',
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      color: 'secondary',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          System overview and management
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

      {/* Appointment Statistics */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Appointment Statistics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {appointmentStats.map((stat, index) => (
            <Card key={index}>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{stat.title}</h3>
                <p className={`mt-2 text-3xl font-semibold text-${stat.color}-600`}>
                  {stat.value}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            className="cursor-pointer hover:shadow-lg transform transition-all duration-200 hover:scale-105"
            onClick={() => navigate('/admin/doctors')}
          >
            <div className="flex items-center p-4">
              <UserPlus className="h-6 w-6 text-primary-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Manage Doctors</h3>
                <p className="text-sm text-gray-500">Add or update doctor profiles</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transform transition-all duration-200 hover:scale-105"
            onClick={() => navigate('/admin/categories')}
          >
            <div className="flex items-center p-4">
              <Calendar className="h-6 w-6 text-primary-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Manage Categories</h3>
                <p className="text-sm text-gray-500">Organize medical specialties</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transform transition-all duration-200 hover:scale-105"
            onClick={() => navigate('/admin/appointments')}
          >
            <div className="flex items-center p-4">
              <CheckCircle className="h-6 w-6 text-primary-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">View Appointments</h3>
                <p className="text-sm text-gray-500">Monitor all appointments</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No recent activity
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;