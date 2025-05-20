import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import FormField from '../../components/common/FormField';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { apiGet, apiPut } from '../../utils/api';
import { User as UserType } from '../../types';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await apiGet<UserType>(`/users/${user?.id}`);
      if (response.success && response.data) {
        setFormData({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
        });
      }
    } catch (error) {
      setError('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await apiPut(`/users/${user?.id}`, formData);
      if (response.success) {
        showNotification('success', 'Profile updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
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
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your personal information
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                label="First Name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
              />

              <FormField
                label="Last Name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>

            <div className="mt-6">
              <FormField
                label="Email Address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                isLoading={saving}
                icon={<Save size={18} />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;