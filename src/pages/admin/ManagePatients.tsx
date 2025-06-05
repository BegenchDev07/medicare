import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, UserPlus } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import EditPatientModal from '../../components/admin/EditPatientModal';
import { apiGet, apiPut, apiDelete } from '../../utils/api';
import { User, UserRole } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';
import { format } from 'date-fns';

const ManagePatients: React.FC = () => {
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await apiGet<User[]>('/users');
      if (response.success && response.data) {
        // Filter only patients
        const patientUsers = response.data.filter(user => user.role === UserRole.PATIENT);
        setPatients(patientUsers);
      } else {
        setError(response.error || 'Failed to fetch patients');
      }
    } catch (error) {
      setError('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient: User) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (data: {
    first_name: string;
    last_name: string;
    email: string;
  }) => {
    try {
      const response = await apiPut(`/users/${selectedPatient?.id}`, data);
      if (response.success) {
        showNotification('success', 'Patient updated successfully');
        fetchPatients();
      } else {
        throw new Error(response.error || 'Failed to update patient');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      const response = await apiDelete(`/users/${id}`);
      if (response.success) {
        showNotification('success', 'Patient deleted successfully');
        setPatients(patients.filter(patient => patient.id !== id));
      } else {
        setError(response.error || 'Failed to delete patient');
      }
    } catch (error) {
      setError('Failed to delete patient');
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Manage Patients</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage registered patients
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
        />
      )}

      <Card className="mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              className="ml-2 flex-1 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {patient.first_name[0]}
                            {patient.last_name[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(patient.created_at), 'PPP')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit2 size={16} />}
                      className="mr-2"
                      onClick={() => handleEdit(patient)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDelete(patient.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedPatient && (
        <EditPatientModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPatient(null);
          }}
          onSubmit={handleEditSubmit}
          patient={selectedPatient}
        />
      )}
    </div>
  );
};

export default ManagePatients;