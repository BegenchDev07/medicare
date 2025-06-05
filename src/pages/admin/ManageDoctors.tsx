import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import AddDoctorModal from '../../components/admin/AddDoctorModal';
import EditDoctorModal from '../../components/admin/EditDoctorModal';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';
import { Doctor, Category } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

const ManageDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  const { showNotification } = useNotification();

  useEffect(() => {
    Promise.all([fetchDoctors(), fetchCategories()]);
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await apiGet<Doctor[]>('/doctors');
      if (response.success && response.data) {
        setDoctors(response.data);
      } else {
        setError(response.error || 'Failed to fetch doctors');
      }
    } catch (error) {
      setError('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiGet<Category[]>('/categories');
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddDoctor = async (doctorData: any) => {
    try {
      const response = await apiPost('/doctors', doctorData);
      if (response.success) {
        showNotification('success', 'Doctor added successfully');
        fetchDoctors();
      } else {
        throw new Error(response.error || 'Failed to add doctor');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleEditDoctor = async (doctorData: any) => {
    try {
      const response = await apiPut(`/doctors/${selectedDoctor?.id}`, doctorData);
      if (response.success) {
        showNotification('success', 'Doctor updated successfully');
        fetchDoctors();
      } else {
        throw new Error(response.error || 'Failed to update doctor');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

    try {
      const response = await apiDelete(`/doctors/${id}`);
      if (response.success) {
        setDoctors(doctors.filter(doctor => doctor.id !== id));
        showNotification('success', 'Doctor deleted successfully');
      } else {
        setError(response.error || 'Failed to delete doctor');
      }
    } catch (error) {
      setError('Failed to delete doctor');
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowEditModal(true);
  };

  const filteredDoctors = doctors.filter(doctor => 
    `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add, edit, or remove doctors from the system
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={18} />}
        >
          Add Doctor
        </Button>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
        />
      )}

      <Card className="mb-6">
        <div className="flex items-center p-4 border-b">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search doctors..."
            className="ml-2 flex-1 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {doctor.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={doctor.avatar}
                            alt={`${doctor.first_name} ${doctor.last_name}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                              {doctor.first_name[0]}
                              {doctor.last_name[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {doctor.first_name} {doctor.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {doctor.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                      {doctor.categoryName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.specialization}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.experience} years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit size={16} />}
                      className="mr-2"
                      onClick={() => handleEdit(doctor)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDelete(doctor.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No doctors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AddDoctorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDoctor}
        categories={categories}
      />

      {selectedDoctor && (
        <EditDoctorModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDoctor(null);
          }}
          onSubmit={handleEditDoctor}
          categories={categories}
          doctor={selectedDoctor}
        />
      )}
    </div>
  );
};

export default ManageDoctors;