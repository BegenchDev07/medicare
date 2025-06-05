import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';
import FormField from '../common/FormField';
import Alert from '../common/Alert';
import { User } from '../../types';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    first_name: string;
    last_name: string;
    email: string;
  }) => Promise<void>;
  patient: User;
}

const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patient,
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email,
      });
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Patient</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="px-6 pt-4">
            <Alert type="error" message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="mt-4">
            <FormField
              label="Email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Update Patient
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientModal;