import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Calendar } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { apiGet } from '../../utils/api';
import { Doctor, Category } from '../../types';

const DoctorsList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchDoctors(), fetchCategories()])
      .finally(() => setLoading(false));
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

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || doctor.category_id.toString() === selectedCategory;

    return matchesSearch && matchesCategory;
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse our list of qualified healthcare professionals
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
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center w-full sm:w-auto">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name, specialization..."
                className="ml-2 flex-1 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {doctor.avatar ? (
                      <img
                        className="h-16 w-16 rounded-full object-cover"
                        src={doctor.avatar}
                        alt={`${doctor.first_name} ${doctor.last_name}`}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xl font-medium text-primary-600">
                          {doctor.first_name?.[0]}
                          {doctor.last_name?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Dr. {doctor.first_name} {doctor.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {doctor.categoryName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 text-warning-400 mr-1" />
                    <span>{doctor.experience}+ years experience</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {doctor.bio || 'No bio available'}
                  </p>
                </div>

                <div className="mt-6">
                  <Button
                    fullWidth
                    icon={<Calendar size={18} />}
                    onClick={() => navigate(`/patient/book/${doctor.id}`)}
                  >
                    Book Appointment
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filteredDoctors.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No doctors found matching your criteria
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DoctorsList;