import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';
import FormField from '../common/FormField';
import Alert from '../common/Alert';
import { format } from 'date-fns';

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    day: string;
    start_time: string;
    end_time: string;
  }) => Promise<void>;
  doctorId: string;
}

const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  doctorId,
}) => {
  const [formData, setFormData] = useState({
    day: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '17:00',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format time values to match HH:mm pattern
    if (name === 'start_time' || name === 'end_time') {
      const [hours, minutes] = value.split(':');
      const formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, [name]: formattedTime }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.day) {
      setError('Please select a date');
      return false;
    }

    const startTime = formData.start_time.split(':').map(Number);
    const endTime = formData.end_time.split(':').map(Number);
    
    if (startTime[0] > endTime[0] || (startTime[0] === endTime[0] && startTime[1] >= endTime[1])) {
      setError('End time must be after start time');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Schedule</h2>
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
          <FormField
            label="Date"
            name="day"
            type="date"
            required
            value={formData.day}
            onChange={handleChange}
            min={format(new Date(), 'yyyy-MM-dd')}
          />

          <FormField
            label="Start Time"
            name="start_time"
            type="time"
            required
            value={formData.start_time}
            onChange={handleChange}
            step="1800"
          />

          <FormField
            label="End Time"
            name="end_time"
            type="time"
            required
            value={formData.end_time}
            onChange={handleChange}
            step="1800"
          />

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
              Add Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScheduleModal;
