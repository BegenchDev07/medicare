import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'info' | 'warning' | 'error';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  dismissible?: boolean;
  className?: string;
  onDismiss?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  dismissible = true,
  className = '',
  onDismiss,
}) => {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) {
    return null;
  }

  const typeClasses = {
    success: 'bg-success-50 text-success-800 border-success-200',
    info: 'bg-primary-50 text-primary-800 border-primary-200',
    warning: 'bg-warning-50 text-warning-800 border-warning-200',
    error: 'bg-error-50 text-error-800 border-error-200',
  };

  const IconComponent = {
    success: CheckCircle,
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
  }[type];

  const iconColors = {
    success: 'text-success-500',
    info: 'text-primary-500',
    warning: 'text-warning-500',
    error: 'text-error-500',
  };

  return (
    <div
      className={`flex rounded-md border p-4 ${typeClasses[type]} ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${iconColors[type]}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className={`text-sm ${title ? 'mt-2' : ''}`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
      {dismissible && (
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={handleDismiss}
              className={`inline-flex rounded-md p-1.5 ${
                iconColors[type]
              } hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type}-50 focus:ring-${type}-500`}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alert;