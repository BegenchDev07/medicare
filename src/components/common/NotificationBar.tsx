import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error';

interface NotificationBarProps {
  type: NotificationType;
  message: string;
  onDismiss: () => void;
}

const NotificationBar: React.FC<NotificationBarProps> = ({ type, message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  const bgColor = type === 'success' ? 'bg-success-50' : 'bg-error-50';
  const textColor = type === 'success' ? 'text-success-800' : 'text-error-800';
  const borderColor = type === 'success' ? 'border-success-200' : 'border-error-200';
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div
      className={`fixed top-16 left-0 right-0 z-50 transform transition-transform duration-300 ease-in-out ${
        message ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className={`w-full border-b ${borderColor} ${bgColor} ${textColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Icon className="h-5 w-5 mr-2" />
              <p className="text-sm font-medium">{message}</p>
            </div>
            <button
              onClick={onDismiss}
              className="rounded-md p-1 hover:bg-white/20 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;